"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { roleLabel } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase/client";

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-700 text-white">
            <Sparkles size={22} />
          </div>

          <div>
            <h1 className="text-lg font-black">
              بصيرة
            </h1>

            <p className="text-xs font-bold text-slate-500">
              منصة تحليل تعلم وتشخيص تربوي
            </p>
          </div>
        </Link>

        <div className="hidden min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right md:block">
          <p className="text-xs font-bold text-slate-500">
            أهلًا بك
          </p>

          <p className="mt-1 text-sm font-black text-slate-950">
            {displayName}
          </p>

          <p className="mt-1 text-xs font-black text-teal-700">
            {displayRole}
          </p>
        </div>
      </div>
    </header>
  );
}
