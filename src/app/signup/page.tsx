"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

const fieldRoles = [
  "school_principal_male",
  "school_principal_female",
  "teacher_male",
  "teacher_female",
  "counselor_male",
  "counselor_female",
] as const;

type FieldRole = (typeof fieldRoles)[number];

type SignupForm = {
  full_name: string;
  role: FieldRole;
  email: string;
  password: string;
};

const roleOptions: Array<{
  value: FieldRole;
  label: string;
}> = [
  { value: "school_principal_male", label: "مدير مدرسة" },
  { value: "school_principal_female", label: "مديرة مدرسة" },
  { value: "teacher_male", label: "معلم" },
  { value: "teacher_female", label: "معلمة" },
  { value: "counselor_male", label: "موجه طلابي" },
  { value: "counselor_female", label: "موجهة طلابية" },
];

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignupForm>({
    full_name: "",
    role: "teacher_male",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof SignupForm>(
    key: K,
    value: SignupForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSignup(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const fullName = form.full_name.trim();
    const email = form.email.trim().toLowerCase();

    if (fullName.length < 2) {
      setError("أدخل الاسم الكامل.");
      return;
    }

    if (!fieldRoles.includes(form.role)) {
      setError("الصفة المحددة غير مسموح بها.");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("أدخل بريدًا إلكترونيًا صحيحًا.");
      return;
    }

    if (form.password.length < 8) {
      setError("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } =
      await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            full_name: fullName,
            role: form.role,
          },
        },
      });

    setLoading(false);

    if (signupError) {
      setError(
        signupError.message || "تعذر إنشاء الحساب."
      );
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    router.replace("/login");
  }

  return (
    <main
      className="min-h-screen bg-slate-50 px-4 py-8"
      dir="rtl"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white">
              <UserPlus size={26} />
            </div>

            <div>
              <p className="text-sm font-black text-teal-700">
                إنشاء حساب
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-950">
                ابدأ باستخدام بصيرة
              </h1>

              <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
                التسجيل مخصص للقيادات المدرسية والمعلمين
                والموجهين الطلابيين.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSignup}
            className="mt-7 space-y-4"
          >
            <Input
              label="الاسم الكامل"
              value={form.full_name}
              onChange={(value) =>
                updateField("full_name", value)
              }
            />

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">
                الصفة
              </span>

              <select
                value={form.role}
                onChange={(event) =>
                  updateField(
                    "role",
                    event.target.value as FieldRole
                  )
                }
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
              >
                {roleOptions.map((role) => (
                  <option
                    key={role.value}
                    value={role.value}
                  >
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="البريد الإلكتروني"
              type="email"
              value={form.email}
              onChange={(value) =>
                updateField("email", value)
              }
            />

            <Input
              label="كلمة المرور"
              type="password"
              value={form.password}
              onChange={(value) =>
                updateField("password", value)
              }
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
              {loading
                ? "جارٍ إنشاء الحساب..."
                : "إنشاء الحساب"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/login")
              }
              className="w-full text-center text-sm font-black text-teal-700"
            >
              لديك حساب؟ تسجيل الدخول
            </button>
          </form>
        </section>

        <section className="hidden rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-slate-50 p-8 lg:block">
          <p className="text-sm font-black text-teal-700">
            منصة بصيرة
          </p>

          <h2 className="mt-3 text-4xl font-black leading-tight text-slate-950">
            تحليل نتائج الطلاب وتحويلها إلى قرارات
            تعليمية قابلة للتنفيذ
          </h2>

          <p className="mt-4 text-sm font-bold leading-8 text-slate-600">
            خدمات بصيرة متاحة للمستخدمين المسجلين
            بحسب أدوارهم وصلاحياتهم.
          </p>
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
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-black text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-14 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
      />
    </label>
  );
}
