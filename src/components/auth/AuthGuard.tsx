"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (!profile || profile.status !== "active") {
        router.replace("/pending");
        return;
      }

      if (mounted) setLoading(false);
    }

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8fb]">
        <div className="rounded-3xl bg-white px-8 py-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-600">جارٍ تحميل بصيرة...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
