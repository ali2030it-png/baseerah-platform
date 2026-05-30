"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, ShieldCheck, Sparkles } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("أدخل البريد الإلكتروني بشكل صحيح.");
      return;
    }

    if (!password) {
      setError("أدخل كلمة المرور.");
      return;
    }

    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      setLoading(false);
      setError("تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("تعذر التحقق من الحساب.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .maybeSingle();

    setLoading(false);

    if (profileError || !profile) {
      setError("لم يتم العثور على ملف المستخدم.");
      return;
    }

    if (profile.status !== "active") {
      router.push("/pending");
      return;
    }

    if (profile.role === "super_admin") {
      router.push("/admin");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="order-2 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:order-1">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white">
            <ArrowRight size={26} />
          </div>

          <p className="mt-7 text-sm font-black text-teal-700">
            تسجيل الدخول
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            دخول منصة بصيرة
          </h1>

          <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
            الحسابات الجديدة تحتاج موافقة مدير النظام قبل الدخول.
          </p>

          <form onSubmit={handleLogin} className="mt-7 space-y-5">
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={setEmail}
            />

            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={setPassword}
            />

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-black text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-teal-700 text-sm font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "جارٍ التحقق..." : "دخول"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="w-full text-center text-sm font-black text-teal-700"
            >
              لا تملك حسابًا؟ إنشاء حساب
            </button>
          </form>
        </section>

        <section className="order-1 overflow-hidden rounded-[2.5rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-slate-100 p-8 lg:order-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-4 py-2 text-sm font-black text-teal-700">
            <Sparkles size={16} />
            منصة بصيرة
          </div>

          <h2 className="mt-6 max-w-2xl text-5xl font-black leading-tight text-slate-950">
            من الأرقام إلى القرار التربوي
          </h2>

          <p className="mt-5 max-w-2xl text-base font-bold leading-8 text-slate-600">
            سجّل دخولك لتحليل نتائج الطلاب، وتشخيص نواتج التعلم، وبناء تقارير تربوية تدعم التحسين والمتابعة.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Feature
              icon={<BarChart3 size={22} />}
              title="تحليل إتقان"
              text="تحويل الدرجات إلى مؤشرات واضحة."
            />

            <Feature
              icon={<ShieldCheck size={22} />}
              title="اعتماد آمن"
              text="الحسابات الجديدة تمر عبر موافقة مدير النظام."
            />
          </div>

          <div className="mt-8 rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-sm font-black text-teal-300">فلسفة بصيرة</p>
            <p className="mt-3 text-xl font-black">
              لا نكتفي بعرض النتائج، بل نربطها بالتشخيص والتوصيات وخطط الدعم.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Input({
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
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
      />
    </label>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
        {icon}
      </div>

      <p className="font-black text-slate-950">{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{text}</p>
    </div>
  );
}
