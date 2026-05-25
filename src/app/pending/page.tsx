"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PendingPage() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6">
      <section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black text-teal-700">طلب الانضمام قيد المراجعة</p>
        <h1 className="mt-3 text-3xl font-black">تم إنشاء حسابك بنجاح</h1>
        <p className="mt-4 text-sm font-bold leading-7 text-slate-600">
          حسابك بانتظار موافقة مدير النظام قبل تفعيل الدخول إلى منصة بصيرة.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={logout}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            تسجيل الخروج
          </button>

          <Link
            href="/login"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700"
          >
            صفحة الدخول
          </Link>
        </div>
      </section>
    </main>
  );
}
