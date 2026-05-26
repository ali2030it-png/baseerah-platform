"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
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
      setError("أدخل بريدًا إلكترونيًا صحيحًا.");
      return;
    }

    if (!password.trim()) {
      setError("أدخل كلمة المرور.");
      return;
    }

    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError || !data.user) {
      setLoading(false);
      setError("تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      router.push("/pending");
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
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-10">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <section className="order-2 text-center lg:order-1">
          <p className="text-sm font-black text-teal-700">تسجيل الدخول</p>

          <h1 className="mt-4 text-5xl font-black leading-tight text-slate-950">
            دخول منصة بصيرة
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base font-bold leading-8 text-slate-600">
            سجّل دخولك إلى منصة تحليل نتائج التدريب والاختبارات. الحسابات الجديدة لا تدخل إلا بعد تفعيل مدير النظام.
          </p>
        </section>

        <section className="order-1 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm lg:order-2">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-950">
                دخول المستخدم
              </h2>

              <p className="mt-2 text-sm font-bold text-slate-500">
                الحسابات الجديدة تحتاج موافقة مدير النظام.
              </p>
            </div>

            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white">
              <LogIn size={26} />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">
                البريد الإلكتروني
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">
                كلمة المرور
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>

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
              {loading ? "جارٍ تسجيل الدخول..." : "دخول"}
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
      </div>
    </main>
  );
}
