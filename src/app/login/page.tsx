"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !data.user) {
      setError("تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile || profile.status !== "active") {
      router.replace("/pending");
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f6f8fb] p-4 text-slate-950">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm font-black text-teal-700">تسجيل الدخول</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
            مرحبًا بك في بصيرة
          </h1>
          <p className="mt-4 max-w-xl text-sm font-bold leading-8 text-slate-600">
            سجّل دخولك للوصول إلى لوحة التحليل والتقارير والخطط العلاجية.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
              <LogIn size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black">دخول المستخدم</h2>
              <p className="text-xs font-bold text-slate-500">
                الحسابات الجديدة تحتاج موافقة مدير النظام.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Field label="البريد الإلكتروني" value={email} onChange={setEmail} type="email" />
            <Field label="كلمة المرور" value={password} onChange={setPassword} type="password" />

            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-black text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              دخول
            </button>

            <p className="text-center text-sm font-bold text-slate-500">
              لا تملك حسابًا؟{" "}
              <Link href="/signup" className="font-black text-teal-700">
                إنشاء حساب
              </Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-teal-600"
      />
    </label>
  );
}
