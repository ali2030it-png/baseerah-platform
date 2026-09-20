"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, ShieldCheck } from "lucide-react";

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
      setError("╪ث╪»╪«┘ ╪د┘╪ذ╪▒┘è╪» ╪د┘╪ح┘┘â╪ز╪▒┘ê┘┘è ╪ذ╪┤┘â┘ ╪╡╪ص┘è╪ص.");
      return;
    }

    if (!password) {
      setError("╪ث╪»╪«┘ ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒.");
      return;
    }

    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      setLoading(false);
      setError("╪ز╪╣╪░╪▒ ╪ز╪│╪ش┘è┘ ╪د┘╪»╪«┘ê┘. ╪ز╪ص┘é┘é ┘à┘ ╪د┘╪ذ╪▒┘è╪» ┘ê┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("╪ز╪╣╪░╪▒ ╪د┘╪ز╪ص┘é┘é ┘à┘ ╪د┘╪ص╪│╪د╪ذ.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .maybeSingle();

    setLoading(false);

    if (profileError || !profile) {
      setError("┘┘à ┘è╪ز┘à ╪د┘╪╣╪س┘ê╪▒ ╪╣┘┘ë ┘à┘┘ ╪د┘┘à╪│╪ز╪«╪»┘à.");
      return;
    }

    if (profile.status !== "active") {
      router.push("/account-status");
      return;
    }

    if (profile.role === "super_admin") {
      router.push("/admin");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main
      dir="rtl"
      className="relative grid min-h-screen place-items-center overflow-hidden bg-[#eef3f5] px-4 py-8 sm:px-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[#d9efee] opacity-80 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-160px] left-[-100px] h-[420px] w-[420px] rounded-full bg-[#dfeaf4] opacity-80 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-[540px]">
        <section className="overflow-hidden rounded-[2rem] border border-[#c7d4da] bg-white shadow-[0_30px_90px_rgba(21,68,90,0.14)]">
          <div className="relative overflow-hidden border-b border-[#cbd9de] bg-[linear-gradient(135deg,#e8f4f4_0%,#eef6f7_55%,#f2f7fa_100%)] px-6 py-7 sm:px-9 sm:py-8">
            <div
              aria-hidden="true"
              className="absolute -left-6 -top-5 grid grid-cols-4 gap-2 opacity-75"
            >
              <span className="h-10 w-2 rounded-full bg-[#0da9a6]/35" />
              <span className="mt-4 h-6 w-2 rounded-full bg-[#3d7eb9]/35" />
              <span className="mt-7 h-3 w-2 rounded-full bg-[#0da9a6]/45" />
              <span className="mt-2 h-8 w-2 rounded-full bg-[#3d7eb9]/30" />
            </div>

            <div className="relative flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-9 w-1.5 rounded-full bg-[var(--accent)]" />

                  <div>
                    <p className="text-[1.75rem] font-black leading-none text-[var(--primary)]">
                      بصيرة
                    </p>

                    <p className="mt-2 text-xs font-bold text-[#526b78]">
                      تحليل التعلم وصناعة القرار
                    </p>
                  </div>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#bfd5da] bg-white/90 px-3.5 py-2 text-[11px] font-black text-[var(--primary)] shadow-sm">
                  <BarChart3 size={15} className="text-[#087e7c]" />
                  منصة تحليل نتائج التعلم
                </div>
              </div>

              <div className="hidden rounded-2xl border border-[#cbd9de] bg-white/85 p-3 shadow-sm sm:block">
                <div className="flex h-14 items-end gap-1.5">
                  <span className="h-5 w-2 rounded-full bg-[#7fc3c0]" />
                  <span className="h-9 w-2 rounded-full bg-[#43aaa6]" />
                  <span className="h-7 w-2 rounded-full bg-[#79a9cf]" />
                  <span className="h-12 w-2 rounded-full bg-[#0da9a6]" />
                  <span className="h-10 w-2 rounded-full bg-[#3d7eb9]" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-9 sm:py-8">
            <header>
              <p className="text-sm font-black text-[#087e7c]">
                بوابة المستخدم
              </p>

              <h1 className="mt-2 text-3xl font-black leading-tight text-[var(--primary)]">
                مرحبًا بعودتك
              </h1>

              <p className="mt-2.5 text-sm font-bold leading-7 text-[#526b78]">
                أدخل بيانات حسابك للوصول إلى التحليلات والتقارير وخدمات بصيرة.
              </p>
            </header>

            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />

              <Input
                label="كلمة المرور"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-black text-[#087e7c] transition hover:text-[#066765]"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-black text-rose-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-black text-white shadow-[0_10px_25px_rgba(21,68,90,0.18)] transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {loading ? "جارٍ التحقق..." : "تسجيل الدخول"}
                </span>

                <ArrowRight size={18} className="rotate-180" />
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-center">
              <span className="text-sm font-bold text-[#526b78]">
                ليس لديك حساب؟
              </span>

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="text-sm font-black text-[#087e7c] transition hover:text-[#066765]"
              >
                إنشاء حساب جديد
              </button>
            </div>

            <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#d1dce1] pt-5 text-xs font-bold text-[#526b78]">
              <ShieldCheck size={15} className="text-[#087e7c]" />
              <span>الدخول وفق حساب المستخدم وصلاحياته</span>
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-[11px] font-bold text-[#526b78]">
          بصيرة · تحليل نتائج التعلم ودعم القرار التربوي
        </p>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[var(--primary)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full rounded-xl border border-[#c5d2d8] bg-white px-4 text-sm font-bold text-[var(--primary)] outline-none transition hover:border-[#9eb5bf] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
      />
    </label>
  );
}
