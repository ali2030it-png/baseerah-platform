"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { roleLabel } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase/client";
import { AuthLogoutButton } from "@/components/basirah/AuthLogoutButton";

type UserProfile = {
  full_name: string | null;
  role: string | null;
};

export function BasirahTopbar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", user.id)
        .maybeSingle();

      if (!ignore) {
        setProfile((data as UserProfile | null) || null);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const displayName = profile?.full_name?.trim() || "مستخدم بصيرة";
  const displayRole = roleLabel(profile?.role);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/dashboard"
          className="group flex items-center gap-3"
          aria-label="الانتقال إلى لوحة بصيرة"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white shadow-sm">
            ب
          </span>

          <span className="leading-none">
            <span className="block text-xl font-black text-[var(--primary)]">
              بصيرة
            </span>
            <span className="mt-1 block text-[11px] font-bold text-[var(--muted)]">
              تحليل التعلم وصناعة القرار
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-right md:block">
            <p className="text-xs font-bold text-[var(--muted)]">أهلًا بك</p>
            <p className="mt-1 text-sm font-black text-[var(--primary)]">{displayName}</p>
            <p className="mt-1 text-xs font-black text-[var(--accent)]">{displayRole}</p>
          </div>

          <AuthLogoutButton />
        </div>
      </div>
    </header>
  );
}
