"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    function authorizeRecovery() {
      if (!active) return;

      setReady(true);
      setChecking(false);
      setError("");

      window.history.replaceState(
        {},
        "",
        "/reset-password"
      );
    }

    function rejectRecovery() {
      if (!active) return;

      setReady(false);
      setChecking(false);
      setError(
        "رابط الاستعادة غير صالح أو انتهت صلاحيته."
      );
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          authorizeRecovery();
        }
      }
    );

    async function initializeRecovery() {
      const url = new URL(window.location.href);

      const code = url.searchParams.get("code");

      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      );

      const isRecoveryHash =
        hashParams.get("type") === "recovery";

      if (code) {
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(
            code
          );

        if (!active) return;

        if (exchangeError || !data.session) {
          rejectRecovery();
          return;
        }

        authorizeRecovery();
        return;
      }

      if (isRecoveryHash) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;

        if (session) {
          authorizeRecovery();
          return;
        }

        rejectRecovery();
        return;
      }

      rejectRecovery();
    }

    initializeRecovery();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!ready) {
      setError(
        "جلسة استعادة كلمة المرور غير صالحة."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "كلمة المرور يجب ألا تقل عن 8 أحرف."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setLoading(false);
      setError(
        "تعذر تحديث كلمة المرور. أعد طلب رابط استعادة جديد."
      );
      return;
    }

    await supabase.auth.signOut({
      scope: "global",
    });

    setLoading(false);

    router.replace("/login");
    router.refresh();
  }

  if (checking) {
    return (
      <main
        className="grid min-h-screen place-items-center bg-slate-50 px-4"
        dir="rtl"
      >
        <p className="text-sm font-black text-slate-600">
          جارٍ التحقق من رابط الاستعادة...
        </p>
      </main>
    );
  }

  return (
    <main
      className="grid min-h-screen place-items-center bg-slate-50 px-4"
      dir="rtl"
    >
      <section className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-9">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white">
            <LockKeyhole size={26} />
          </div>

          <div>
            <p className="text-sm font-black text-teal-700">
              أمان الحساب
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              تعيين كلمة مرور جديدة
            </h1>

            <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
              اختر كلمة مرور جديدة لحسابك في بصيرة.
            </p>
          </div>
        </div>

        {!ready ? (
          <div className="mt-7">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold leading-7 text-rose-700">
              {error}
            </div>

            <Link
              href="/forgot-password"
              className="mt-5 block text-center text-sm font-black text-teal-700"
            >
              طلب رابط استعادة جديد
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">
                كلمة المرور الجديدة
              </span>

              <input
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">
                تأكيد كلمة المرور
              </span>

              <input
                type="password"
                value={confirmPassword}
                autoComplete="new-password"
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
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
                ? "جارٍ تحديث كلمة المرور..."
                : "حفظ كلمة المرور الجديدة"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
