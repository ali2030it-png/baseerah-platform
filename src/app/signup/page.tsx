"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const roles = [
  { value: "teacher_male", label: "معلم" },
  { value: "teacher_female", label: "معلمة" },
  { value: "counselor_male", label: "مرشد طلابي" },
  { value: "counselor_female", label: "مرشدة طلابية" },
];

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [region, setRegion] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("teacher_male");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("أكمل الاسم والبريد الإلكتروني وكلمة المرور.");
      setLoading(false);
      return;
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          school_name: schoolName,
          region,
          mobile,
        },
      },
    });

    if (signupError || !data.user) {
      setError(signupError?.message || "تعذر إنشاء الحساب.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      email,
      role,
      status: "pending",
      school_name: schoolName,
      region,
      mobile,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.replace("/pending");
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f6f8fb] p-4 text-slate-950">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm font-black text-teal-700">إنشاء حساب جديد</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
            انضم إلى منصة بصيرة
          </h1>
          <p className="mt-4 max-w-xl text-sm font-bold leading-8 text-slate-600">
            أنشئ حسابك لاستخدام أدوات تحليل نتائج التدريب والاختبارات، وسيبقى
            الحساب قيد المراجعة حتى يفعّله مدير النظام.
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-700 text-white">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black">بيانات الانضمام</h2>
              <p className="text-xs font-bold text-slate-500">
                الأدوار المعتمدة: معلم، معلمة، مرشد، مرشدة
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Field label="الاسم الكامل" value={fullName} onChange={setFullName} />
            <Field label="اسم المدرسة" value={schoolName} onChange={setSchoolName} />
            <Field label="المنطقة / الإدارة التعليمية" value={region} onChange={setRegion} />
            <Field label="رقم الجوال" value={mobile} onChange={setMobile} />

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">الصفة</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-teal-600"
              >
                {roles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

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
              إنشاء الحساب
            </button>

            <p className="text-center text-sm font-bold text-slate-500">
              لديك حساب؟{" "}
              <Link href="/login" className="font-black text-teal-700">
                تسجيل الدخول
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
