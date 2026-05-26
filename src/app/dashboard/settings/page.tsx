"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type ReportSettings = {
  school_name: string;
  education_department: string;
  principal_name: string;
  preparer_name: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<ReportSettings>({
    school_name: "",
    education_department: "",
    principal_name: "",
    preparer_name: "",
  });

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(key: keyof ReportSettings, value: string) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function loadSettings() {
    setLoading(true);
    setError("");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setLoading(false);
      setError("تعذر قراءة بيانات المستخدم.");
      return;
    }

    setUserId(userData.user.id);

    const { data, error: settingsError } = await supabase
      .from("report_settings")
      .select("school_name,education_department,principal_name,preparer_name")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    setLoading(false);

    if (settingsError) {
      setError(settingsError.message);
      return;
    }

    if (data) {
      setSettings({
        school_name: data.school_name || "",
        education_department: data.education_department || "",
        principal_name: data.principal_name || "",
        preparer_name: data.preparer_name || "",
      });
    }
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    setError("");

    const { error: saveError } = await supabase
      .from("report_settings")
      .upsert({
        user_id: userId,
        school_name: settings.school_name.trim(),
        education_department: settings.education_department.trim(),
        principal_name: settings.principal_name.trim(),
        preparer_name: settings.preparer_name.trim(),
        updated_at: new Date().toISOString(),
      });

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setMessage("تم حفظ إعدادات التقرير بنجاح.");
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black text-teal-700">
          إعدادات التقرير
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          بيانات الهيدر والاعتماد
        </h1>

        <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
          هذه البيانات تظهر في هيدر التقرير والاعتماد فقط، ولا تُستخدم في إحصاءات مدير النظام.
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-black text-slate-400">
            جارٍ تحميل الإعدادات...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="اسم المدرسة في التقرير"
              value={settings.school_name}
              onChange={(value) => updateField("school_name", value)}
            />

            <Input
              label="الإدارة التعليمية في التقرير"
              value={settings.education_department}
              onChange={(value) => updateField("education_department", value)}
            />

            <Input
              label="اسم مدير المدرسة للاعتماد"
              value={settings.principal_name}
              onChange={(value) => updateField("principal_name", value)}
            />

            <Input
              label="اسم معد التقرير"
              value={settings.preparer_name}
              onChange={(value) => updateField("preparer_name", value)}
            />
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={saveSettings}
          disabled={saving || loading}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl bg-teal-700 px-6 text-sm font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
        </button>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none transition focus:border-teal-600 focus:bg-white"
      />
    </label>
  );
}
