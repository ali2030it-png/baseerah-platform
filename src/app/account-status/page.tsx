import Link from "next/link";

import { AuthLogoutButton } from "@/components/basirah/AuthLogoutButton";

export default function AccountStatusPage() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-slate-50 px-4"
      dir="rtl"
    >
      <section className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black text-amber-700">
          حالة الحساب
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-950">
          الحساب غير متاح حاليًا
        </h1>

        <p className="mt-3 text-sm font-bold leading-7 text-slate-600">
          إذا كان الحساب موقوفًا أو مرفوضًا فتواصل مع مدير النظام.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700"
          >
            العودة إلى المنصة
          </Link>

          <AuthLogoutButton />
        </div>
      </section>
    </main>
  );
}
