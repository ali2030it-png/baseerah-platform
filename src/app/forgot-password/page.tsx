"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("أدخل بريدًا إلكترونيًا صحيحًا.");
      return;
    }

    setLoading(true);

    const redirectTo =
      `${window.location.origin}/reset-password`;

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo,
        }
      );

    setLoading(false);

    if (resetError) {
      setError(
        "تعذر إرسال طلب الاستعادة الآن. حاول مرة أخرى بعد قليل."
      );
      return;
    }

    setSent(true);
  }

  return (
    <main
      className="grid min-h-screen place-items-center bg-slate-50 px-4"
      dir="rtl"
    >
      <section className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-9">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white">
            <KeyRound size={26} />
          </div>

          <div>
            <p className="text-sm font-black text-teal-700">
              استعادة الحساب
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              نسيت كلمة المرور؟
            </h1>

            <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
              أدخل البريد المرتبط بحسابك وسنرسل لك رابطًا
              آمنًا لتعيين كلمة مرور جديدة.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="mt-7">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-bold leading-7 text-emerald-800">
              إذا كان البريد مرتبطًا بحساب في بصيرة فستصلك
              رسالة استعادة. افتح الرابط الموجود في الرسالة
              لإكمال تعيين كلمة المرور.
            </div>

            <Link
              href="/login"
              className="mt-5 block text-center text-sm font-black text-teal-700"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">
                البريد الإلكتروني
              </span>

              <input
                type="email"
                value={email}
                autoComplete="email"
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
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
              {loading
                ? "جارٍ إرسال الرابط..."
                : "إرسال رابط الاستعادة"}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm font-black text-teal-700"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </form>
        )}
      </section>
    </main>
  );
}
