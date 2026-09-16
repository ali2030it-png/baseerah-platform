-- Baseerah Identity V2 - FINAL R2
-- 2026-09-16
-- Scope: authentication/profile registration contract only.
-- No existing profile row is updated or deleted by this migration.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- ===========================================================================
-- 1) FAIL-CLOSED PREFLIGHT
-- ===========================================================================
do $preflight$
declare
  v_super_admin_total integer;
  v_super_admin_active integer;
  v_trigger_count integer;
  v_policy_count integer;
  v_rls_enabled boolean;
  v_force_rls boolean;
  v_unexpected integer;
begin
  select count(*)
    into v_super_admin_total
  from public.profiles
  where role = 'super_admin';

  select count(*)
    into v_super_admin_active
  from public.profiles
  where role = 'super_admin'
    and status = 'active';

  if v_super_admin_total <> 1 or v_super_admin_active <> 1 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: expected exactly one active super_admin; total=%, active=%',
      v_super_admin_total,
      v_super_admin_active;
  end if;

  select c.relrowsecurity, c.relforcerowsecurity
    into v_rls_enabled, v_force_rls
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'profiles';

  if coalesce(v_rls_enabled, false) is not true
     or coalesce(v_force_rls, false) is not false then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: profiles RLS state changed; enabled=%, force=%',
      v_rls_enabled,
      v_force_rls;
  end if;

  select count(*)
    into v_trigger_count
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'auth'
    and c.relname = 'users'
    and not t.tgisinternal;

  if v_trigger_count <> 2 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: expected exactly two user-defined auth.users triggers; found %',
      v_trigger_count;
  end if;

  select count(*)
    into v_unexpected
  from (
    select
      t.tgname,
      fn_ns.nspname as function_schema,
      p.proname as function_name
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_proc p on p.oid = t.tgfoid
    join pg_namespace fn_ns on fn_ns.oid = p.pronamespace
    where n.nspname = 'auth'
      and c.relname = 'users'
      and not t.tgisinternal
  ) x
  where not (
    (x.tgname = 'on_auth_user_created'
      and x.function_schema = 'public'
      and x.function_name = 'handle_new_user')
    or
    (x.tgname = 'on_auth_user_created_create_profile'
      and x.function_schema = 'public'
      and x.function_name = 'handle_new_user_profile')
  );

  if v_unexpected <> 0 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: auth.users trigger contract changed';
  end if;

  select count(*)
    into v_policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename = 'profiles';

  if v_policy_count <> 8 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: expected 8 profiles policies; found %',
      v_policy_count;
  end if;

  select count(*)
    into v_unexpected
  from pg_policies
  where schemaname = 'public'
    and tablename = 'profiles'
    and policyname not in (
      'Super admins can read all profiles',
      'Super admins can update all profiles',
      'Users can insert their own profile',
      'Users can read their own profile only',
      'Users can update their own profile only',
      'profiles_insert_own',
      'profiles_select_own',
      'profiles_update_own'
    );

  if v_unexpected <> 0 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: unexpected profiles policy detected';
  end if;

  if to_regprocedure('public.handle_new_user_v2()') is not null then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: public.handle_new_user_v2 already exists';
  end if;

  if to_regclass('public.profiles_single_super_admin_uidx') is not null then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: profiles_single_super_admin_uidx already exists';
  end if;

  if to_regnamespace('baseerah_identity_v2_backup') is not null then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: backup schema already exists';
  end if;
end
$preflight$;

-- ===========================================================================
-- 2) REVERSIBLE SECURITY-CONTRACT BACKUP
-- No application/profile data is copied.
-- ===========================================================================
create schema baseerah_identity_v2_backup;
revoke all on schema baseerah_identity_v2_backup from public, anon, authenticated;

create table baseerah_identity_v2_backup.meta (
  migration_key text primary key,
  created_at timestamptz not null default now(),
  profiles_rls_enabled boolean not null,
  profiles_force_rls boolean not null,
  profiles_count bigint not null,
  super_admin_count bigint not null
);

create table baseerah_identity_v2_backup.policies (
  migration_key text not null,
  policyname text not null,
  permissive text not null,
  roles text[] not null,
  cmd text not null,
  qual text,
  with_check text,
  primary key (migration_key, policyname)
);

create table baseerah_identity_v2_backup.triggers (
  migration_key text not null,
  trigger_name text not null,
  trigger_definition text not null,
  trigger_enabled "char" not null,
  primary key (migration_key, trigger_name)
);

create table baseerah_identity_v2_backup.table_grants (
  migration_key text not null,
  grantee text not null,
  privilege_type text not null,
  is_grantable text not null,
  primary key (migration_key, grantee, privilege_type)
);

-- IMPORTANT: this stores only real column ACL entries from pg_attribute.attacl.
-- It does not duplicate table-level grants as information_schema.column_privileges does.
create table baseerah_identity_v2_backup.explicit_column_grants (
  migration_key text not null,
  grantee text not null,
  column_name text not null,
  privilege_type text not null,
  is_grantable boolean not null,
  primary key (migration_key, grantee, column_name, privilege_type)
);

insert into baseerah_identity_v2_backup.meta (
  migration_key,
  profiles_rls_enabled,
  profiles_force_rls,
  profiles_count,
  super_admin_count
)
select
  '20260916_identity_v2_r2',
  c.relrowsecurity,
  c.relforcerowsecurity,
  (select count(*) from public.profiles),
  (select count(*) from public.profiles where role = 'super_admin')
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'profiles';

insert into baseerah_identity_v2_backup.policies (
  migration_key,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
)
select
  '20260916_identity_v2_r2',
  p.policyname,
  p.permissive,
  p.roles::text[],
  p.cmd,
  p.qual,
  p.with_check
from pg_policies p
where p.schemaname = 'public'
  and p.tablename = 'profiles';

insert into baseerah_identity_v2_backup.triggers (
  migration_key,
  trigger_name,
  trigger_definition,
  trigger_enabled
)
select
  '20260916_identity_v2_r2',
  t.tgname,
  pg_get_triggerdef(t.oid, true),
  t.tgenabled
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'auth'
  and c.relname = 'users'
  and not t.tgisinternal;

insert into baseerah_identity_v2_backup.table_grants (
  migration_key,
  grantee,
  privilege_type,
  is_grantable
)
select
  '20260916_identity_v2_r2',
  g.grantee,
  g.privilege_type,
  g.is_grantable
from information_schema.table_privileges g
where g.table_schema = 'public'
  and g.table_name = 'profiles'
  and g.grantee in ('anon', 'authenticated', 'PUBLIC');

insert into baseerah_identity_v2_backup.explicit_column_grants (
  migration_key,
  grantee,
  column_name,
  privilege_type,
  is_grantable
)
select
  '20260916_identity_v2_r2',
  case
    when acl.grantee = 0 then 'PUBLIC'
    else grantee_role.rolname
  end,
  a.attname,
  acl.privilege_type,
  acl.is_grantable
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
  );

-- ===========================================================================
-- 3) ONE CANONICAL SIGNUP FUNCTION
-- ===========================================================================
create function public.handle_new_user_v2()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  requested_role text := pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'role', ''));
  requested_full_name text := pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
begin
  if not (
    requested_role = any (
      array[
        'school_principal_male',
        'school_principal_female',
        'teacher_male',
        'teacher_female',
        'counselor_male',
        'counselor_female'
      ]::text[]
    )
  ) then
    raise exception using
      errcode = '22023',
      message = 'BASEERAH_SIGNUP_ROLE_NOT_ALLOWED';
  end if;

  if requested_full_name = '' then
    requested_full_name := pg_catalog.btrim(
      pg_catalog.split_part(coalesce(new.email, ''), '@', 1)
    );
  end if;

  if requested_full_name = '' then
    requested_full_name := 'مستخدم بصيرة';
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    status,
    updated_at
  )
  values (
    new.id,
    requested_full_name,
    new.email,
    requested_role,
    'active',
    pg_catalog.now()
  )
  on conflict (id) do nothing;

  insert into public.report_settings (
    user_id,
    preparer_name,
    updated_at
  )
  values (
    new.id,
    requested_full_name,
    pg_catalog.now()
  )
  on conflict (user_id) do nothing;

  return new;
end
$function$;

revoke all on function public.handle_new_user_v2() from public, anon, authenticated;

-- ===========================================================================
-- 4) REPLACE TWO LEGACY TRIGGERS WITH ONE
-- Legacy functions stay dormant for rollback.
-- ===========================================================================
drop trigger on_auth_user_created on auth.users;
drop trigger on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_profile_v2
after insert on auth.users
for each row
execute function public.handle_new_user_v2();

-- ===========================================================================
-- 5) SUPER_ADMIN INVARIANTS
-- Unique index prevents creation of a second super_admin by any privileged path.
-- RLS below also prevents client-side modification/promotion involving super_admin.
-- ===========================================================================
create unique index profiles_single_super_admin_uidx
on public.profiles ((role))
where role = 'super_admin';

-- ===========================================================================
-- 6) MINIMAL PROFILES RLS CONTRACT
-- ===========================================================================
do $drop_policies$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format(
      'drop policy %I on public.profiles',
      r.policyname
    );
  end loop;
end
$drop_policies$;

create policy profiles_select_own_v2
on public.profiles
as permissive
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_select_all_super_admin_v2
on public.profiles
as permissive
for select
to authenticated
using (public.is_super_admin());

create policy profiles_update_non_super_admin_v2
on public.profiles
as permissive
for update
to authenticated
using (
  public.is_super_admin()
  and role <> 'super_admin'
)
with check (
  public.is_super_admin()
  and role <> 'super_admin'
);

-- ===========================================================================
-- 7) MINIMAL TABLE/COLUMN PRIVILEGES
-- ===========================================================================
revoke all privileges on table public.profiles from public, anon, authenticated;

do $revoke_explicit_columns$
declare
  r record;
  rendered_grantee text;
begin
  for r in
    select distinct
      grantee,
      column_name,
      privilege_type
    from baseerah_identity_v2_backup.explicit_column_grants
    where migration_key = '20260916_identity_v2_r2'
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
$revoke_explicit_columns$;

-- Table-level UPDATE remains necessary for the existing admin-users UI.
-- RLS makes it effective only for updates of NON-super_admin rows by the active super_admin.
grant select, update on table public.profiles to authenticated;

-- ===========================================================================
-- 8) POST-CONDITIONS; ANY FAILURE ROLLS BACK THE WHOLE TRANSACTION
-- ===========================================================================
do $postcheck$
declare
  v_before_profiles bigint;
  v_count integer;
begin
  select profiles_count
    into v_before_profiles
  from baseerah_identity_v2_backup.meta
  where migration_key = '20260916_identity_v2_r2';

  if (select count(*) from public.profiles) <> v_before_profiles then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: existing profiles count changed during migration';
  end if;

  if (
    select count(*)
    from public.profiles
    where role = 'super_admin'
      and status = 'active'
  ) <> 1 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: active super_admin invariant failed';
  end if;

  select count(*)
    into v_count
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  join pg_proc p on p.oid = t.tgfoid
  join pg_namespace fn_ns on fn_ns.oid = p.pronamespace
  where n.nspname = 'auth'
    and c.relname = 'users'
    and not t.tgisinternal
    and t.tgname = 'on_auth_user_created_profile_v2'
    and fn_ns.nspname = 'public'
    and p.proname = 'handle_new_user_v2';

  if v_count <> 1 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: canonical auth trigger not installed exactly once';
  end if;

  if (
    select count(*)
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'auth'
      and c.relname = 'users'
      and not t.tgisinternal
  ) <> 1 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: unexpected extra auth.users trigger remains';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  ) <> 3 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: profiles policy count is not 3';
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
      'BASEERAH_IDENTITY_V2_ABORT: unexpected V2 profiles policy';
  end if;

  if exists (
    select 1
    from information_schema.table_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee in ('anon', 'PUBLIC')
  ) then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: anon/PUBLIC table privilege remains on profiles';
  end if;

  if exists (
    select 1
    from information_schema.column_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee in ('anon', 'PUBLIC')
  ) then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: anon/PUBLIC column privilege remains on profiles';
  end if;

  if exists (
    select 1
    from information_schema.table_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee = 'authenticated'
      and privilege_type not in ('SELECT', 'UPDATE')
  ) then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: authenticated retains an unexpected profiles privilege';
  end if;

  if (
    select count(*)
    from information_schema.table_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee = 'authenticated'
      and privilege_type in ('SELECT', 'UPDATE')
  ) <> 2 then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: authenticated SELECT/UPDATE contract incomplete';
  end if;

  if has_function_privilege('anon', 'public.handle_new_user_v2()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.handle_new_user_v2()', 'EXECUTE') then
    raise exception
      'BASEERAH_IDENTITY_V2_ABORT: signup trigger function is directly executable by client roles';
  end if;
end
$postcheck$;

commit;

select
  'BASEERAH_IDENTITY_V2_R2_MIGRATION_PASS' as result,
  count(*) as profiles_count,
  count(*) filter (where role = 'super_admin') as super_admin_count,
  count(*) filter (where role = 'super_admin' and status = 'active') as active_super_admin_count,
  count(*) filter (where status = 'active') as active_profiles_count
from public.profiles;
