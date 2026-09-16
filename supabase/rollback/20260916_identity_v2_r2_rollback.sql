-- Baseerah Identity V2 - FINAL R2 ROLLBACK
-- 2026-09-16
-- Run only if 20260916_identity_v2_r2.sql committed successfully.
-- Restores the pre-migration trigger/RLS/grant contract.
-- It does not delete application/profile data created after migration.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- ===========================================================================
-- 1) FAIL-CLOSED ROLLBACK PREFLIGHT
-- ===========================================================================
do $preflight$
declare
  v_count integer;
begin
  if to_regnamespace('baseerah_identity_v2_backup') is null then
    raise exception
      'BASEERAH_IDENTITY_V2_ROLLBACK_ABORT: backup schema not found';
  end if;

  if not exists (
    select 1
    from baseerah_identity_v2_backup.meta
    where migration_key = '20260916_identity_v2_r2'
  ) then
    raise exception
      'BASEERAH_IDENTITY_V2_ROLLBACK_ABORT: R2 backup metadata not found';
  end if;

  select count(*)
    into v_count
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'auth'
    and c.relname = 'users'
    and not t.tgisinternal
    and t.tgname = 'on_auth_user_created_profile_v2';

  if v_count <> 1 then
    raise exception
      'BASEERAH_IDENTITY_V2_ROLLBACK_ABORT: canonical V2 trigger not found exactly once';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  ) <> 3 then
    raise exception
      'BASEERAH_IDENTITY_V2_ROLLBACK_ABORT: V2 profiles policy contract changed';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname not in (
        'profiles_select_own_v2',
        'profiles_select_all_super_admin_v2',
        'profiles_update_non_super_admin_v2'
      )
  ) then
    raise exception
      'BASEERAH_IDENTITY_V2_ROLLBACK_ABORT: unexpected V2 profiles policy detected';
  end if;
end
$preflight$;

-- ===========================================================================
-- 2) REMOVE V2 CONTRACT
-- ===========================================================================
drop trigger on_auth_user_created_profile_v2 on auth.users;

drop policy profiles_select_own_v2 on public.profiles;
drop policy profiles_select_all_super_admin_v2 on public.profiles;
drop policy profiles_update_non_super_admin_v2 on public.profiles;

drop index if exists public.profiles_single_super_admin_uidx;

revoke all privileges on table public.profiles from public, anon, authenticated;

do $revoke_current_explicit_columns$
declare
  r record;
  rendered_grantee text;
begin
  for r in
    select distinct
      case
        when acl.grantee = 0 then 'PUBLIC'
        else grantee_role.rolname
      end as grantee,
      a.attname as column_name,
      acl.privilege_type
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a
      on a.attrelid = c.oid
     and a.attnum > 0
     and not a.attisdropped
    cross join lateral aclexplode(a.attacl) acl
    left join pg_roles grantee_role on grantee_role.oid = acl.grantee
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and a.attacl is not null
      and (
        acl.grantee = 0
        or grantee_role.rolname in ('anon', 'authenticated')
      )
  loop
    rendered_grantee :=
      case
        when upper(r.grantee) = 'PUBLIC' then 'PUBLIC'
        else quote_ident(r.grantee)
      end;

    execute format(
      'revoke %s (%I) on table public.profiles from %s',
      r.privilege_type,
      r.column_name,
      rendered_grantee
    );
  end loop;
end
$revoke_current_explicit_columns$;

-- ===========================================================================
-- 3) RESTORE LEGACY POLICIES
-- ===========================================================================
do $restore_policies$
declare
  r record;
  rendered_roles text;
  ddl text;
begin
  for r in
    select *
    from baseerah_identity_v2_backup.policies
    where migration_key = '20260916_identity_v2_r2'
    order by policyname
  loop
    select string_agg(
      case
        when lower(role_name) = 'public' then 'PUBLIC'
        else quote_ident(role_name)
      end,
      ', '
      order by role_name
    )
    into rendered_roles
    from unnest(r.roles) as role_name;

    ddl := format(
      'create policy %I on public.profiles as %s for %s to %s',
      r.policyname,
      r.permissive,
      r.cmd,
      rendered_roles
    );

    if r.qual is not null then
      ddl := ddl || format(' using (%s)', r.qual);
    end if;

    if r.with_check is not null then
      ddl := ddl || format(' with check (%s)', r.with_check);
    end if;

    execute ddl;
  end loop;
end
$restore_policies$;

-- ===========================================================================
-- 4) RESTORE LEGACY TABLE GRANTS
-- ===========================================================================
do $restore_table_grants$
declare
  r record;
  rendered_grantee text;
  ddl text;
begin
  for r in
    select *
    from baseerah_identity_v2_backup.table_grants
    where migration_key = '20260916_identity_v2_r2'
    order by grantee, privilege_type
  loop
    rendered_grantee :=
      case
        when upper(r.grantee) = 'PUBLIC' then 'PUBLIC'
        else quote_ident(r.grantee)
      end;

    ddl := format(
      'grant %s on table public.profiles to %s',
      r.privilege_type,
      rendered_grantee
    );

    if r.is_grantable = 'YES' then
      ddl := ddl || ' with grant option';
    end if;

    execute ddl;
  end loop;
end
$restore_table_grants$;

-- ===========================================================================
-- 5) RESTORE ONLY REAL EXPLICIT COLUMN ACLS
-- ===========================================================================
do $restore_explicit_column_grants$
declare
  r record;
  rendered_grantee text;
  ddl text;
begin
  for r in
    select *
    from baseerah_identity_v2_backup.explicit_column_grants
    where migration_key = '20260916_identity_v2_r2'
    order by grantee, column_name, privilege_type
  loop
    rendered_grantee :=
      case
        when upper(r.grantee) = 'PUBLIC' then 'PUBLIC'
        else quote_ident(r.grantee)
      end;

    ddl := format(
      'grant %s (%I) on table public.profiles to %s',
      r.privilege_type,
      r.column_name,
      rendered_grantee
    );

    if r.is_grantable then
      ddl := ddl || ' with grant option';
    end if;

    execute ddl;
  end loop;
end
$restore_explicit_column_grants$;

-- ===========================================================================
-- 6) RESTORE LEGACY AUTH.USERS TRIGGERS AND ENABLED STATES
-- ===========================================================================
do $restore_triggers$
declare
  r record;
begin
  for r in
    select *
    from baseerah_identity_v2_backup.triggers
    where migration_key = '20260916_identity_v2_r2'
    order by trigger_name
  loop
    execute r.trigger_definition;

    if r.trigger_enabled = 'D' then
      execute format(
        'alter table auth.users disable trigger %I',
        r.trigger_name
      );
    elsif r.trigger_enabled = 'R' then
      execute format(
        'alter table auth.users enable replica trigger %I',
        r.trigger_name
      );
    elsif r.trigger_enabled = 'A' then
      execute format(
        'alter table auth.users enable always trigger %I',
        r.trigger_name
      );
    else
      execute format(
        'alter table auth.users enable trigger %I',
        r.trigger_name
      );
    end if;
  end loop;
end
$restore_triggers$;

-- ===========================================================================
-- 7) RESTORE RLS TABLE STATE
-- ===========================================================================
do $restore_rls$
declare
  v_enabled boolean;
  v_force boolean;
begin
  select profiles_rls_enabled, profiles_force_rls
    into v_enabled, v_force
  from baseerah_identity_v2_backup.meta
  where migration_key = '20260916_identity_v2_r2';

  if v_enabled then
    execute 'alter table public.profiles enable row level security';
  else
    execute 'alter table public.profiles disable row level security';
  end if;

  if v_force then
    execute 'alter table public.profiles force row level security';
  else
    execute 'alter table public.profiles no force row level security';
  end if;
end
$restore_rls$;

drop function public.handle_new_user_v2();

-- ===========================================================================
-- 8) FUNCTIONAL RESTORE POSTCHECK
-- ===========================================================================
do $postcheck$
declare
  v_expected_policy_count integer;
  v_expected_trigger_count integer;
begin
  if (
    select count(*)
    from public.profiles
    where role = 'super_admin'
      and status = 'active'
  ) <> 1 then
    raise exception
      'BASEERAH_IDENTITY_V2_ROLLBACK_ABORT: active super_admin invariant failed';
  end if;

  select count(*)
    into v_expected_trigger_count
  from baseerah_identity_v2_backup.triggers
  where migration_key = '20260916_identity_v2_r2';

  if (
    select count(*)
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'auth'
      and c.relname = 'users'
      and not t.tgisinternal
  ) <> v_expected_trigger_count then
    raise exception
      'BASEERAH_IDENTITY_V2_ROLLBACK_ABORT: legacy trigger count not restored';
  end if;

  if exists (
    (
      select
        t.tgname,
        pg_get_triggerdef(t.oid, true),
        t.tgenabled
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'auth'
        and c.relname = 'users'
        and not t.tgisinternal
      except
      select
        trigger_name,
        trigger_definition,
        trigger_enabled
      from baseerah_identity_v2_backup.triggers
      where migration_key = '20260916_identity_v2_r2'
    )
    union all
    (
      select
        trigger_name,
        trigger_definition,
        trigger_enabled
      from baseerah_identity_v2_backup.triggers
      where migration_key = '20260916_identity_v2_r2'
      except
      select
        t.tgname,
        pg_get_triggerdef(t.oid, true),
        t.tgenabled
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'auth'
        and c.relname = 'users'
        and not t.tgisinternal
    )
  ) then
    raise exception
      'BASEERAH_IDENTITY_V2_ROLLBACK_ABORT: legacy trigger definitions not restored';
  end if;

  select count(*)
    into v_expected_policy_count
  from baseerah_identity_v2_backup.policies
  where migration_key = '20260916_identity_v2_r2';

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  ) <> v_expected_policy_count then
    raise exception
      'BASEERAH_IDENTITY_V2_ROLLBACK_ABORT: legacy policy count not restored';
  end if;
end
$postcheck$;

drop schema baseerah_identity_v2_backup cascade;

commit;

select
  'BASEERAH_IDENTITY_V2_R2_ROLLBACK_PASS' as result,
  count(*) as profiles_count,
  count(*) filter (where role = 'super_admin') as super_admin_count,
  count(*) filter (where role = 'super_admin' and status = 'active') as active_super_admin_count
from public.profiles;
