"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type SignupForm = {
  first_name: string;
  last_name: string;
  school_name: string;
  region: string;
  mobile: string;
  role: string;
  email: string;
  password: string;
};

const roleOptions = [
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
    first_name: "",
    last_name: "",
    school_name: "",
    region: "",
    mobile: "",
    role: "school_principal_male",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(key: keyof SignupForm, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!form.first_name.trim()) {
      setError("أدخل الاسم الأول.");
      return;
    }

    if (!form.last_name.trim()) {
      setError("أدخل الاسم الأخير.");
      return;
    }

    if (!form.school_name.trim()) {
      setError("أدخل اسم المدرسة.");
      return;
    }

    if (!form.region.trim()) {
      setError("أدخل المنطقة أو الإدارة التعليمية.");
      return;
    }

    if (!form.mobile.trim()) {
      setError("أدخل رقم الجوال.");
      return;
    }

    if (!form.email.trim() || !form.email.includes("@")) {
      setError("أدخل بريدًا إلكترونيًا صحيحًا.");
      return;
    }

    if (form.password.length < 6) {
      setError("كلمة المرور يجب ألا تقل عن 6 أحرف.");
      return;
    }

    const fullName = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();

    setLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: fullName,
          school_name: form.school_name.trim(),
          region: form.region.trim(),
          mobile: form.mobile.trim(),
          role: form.role,
        },
      },
    });

    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    router.push("/pending");
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-10">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <section className="order-2 text-center lg:order-1">
          <p className="text-sm font-black text-teal-700">إنشاء حساب جديد</p>

          <h1 className="mt-4 text-5xl font-black leading-tight text-slate-950">
            انضم إلى منصة بصيرة
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base font-bold leading-8 text-slate-600">
            أنشئ حسابك لاستخدام أدوات تحليل نتائج التدريب والاختبارات، وسيبقى الحساب قيد المراجعة حتى يفعّله مدير النظام.
          </p>
        </section>

        <section className="order-1 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm lg:order-2">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-950">
                بيانات الانضمام
              </h2>

              <p className="mt-2 text-sm font-bold text-slate-500">
                الأدوار المعتمدة: معلم، معلمة، مرشد، مرشدة
              </p>
            </div>

            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-700 text-white">
              <UserPlus size={26} />
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="الاسم الأول"
                value={form.first_name}
                onChange={(value) => updateField("first_name", value)}
              />

              <Input
                label="الاسم الأخير"
                value={form.last_name}
                onChange={(value) => updateField("last_name", value)}
              />
            </div>
<Input
              label="اسم المدرسة"
              value={form.school_name}
              onChange={(value) => updateField("school_name", value)}
            />

            <Input
              label="المنطقة / الإدارة التعليمية"
              value={form.region}
              onChange={(value) => updateField("region", value)}
            />

            <Input
              label="رقم الجوال"
              value={form.mobile}
              onChange={(value) => updateField("mobile", value)}
            />

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">الصفة</span>

              <select
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="البريد الإلكتروني"
              type="email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
            />

            <Input
              label="كلمة المرور"
              type="password"
              value={form.password}
              onChange={(value) => updateField("password", value)}
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
              {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full text-center text-sm font-black text-teal-700"
            >
              لديك حساب؟ تسجيل الدخول
            </button>
          </form>
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
        className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
      />
    </label>
  );
}
