"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, ShieldCheck, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  school_name: string | null;
  region: string | null;
  mobile: string | null;
  created_at: string;
};

function roleLabel(role: string) {
  if (role === "teacher_male") return "معلم";
  if (role === "teacher_female") return "معلمة";
  if (role === "counselor_male") return "مرشد طلابي";
  if (role === "counselor_female") return "مرشدة طلابية";
  if (role === "admin") return "مدير النظام";
  return role;
}

function statusLabel(status: string) {
  if (status === "pending") return "قيد المراجعة";
  if (status === "active") return "مفعّل";
  if (status === "rejected") return "مرفوض";
  if (status === "suspended") return "معلّق";
  return status;
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function loadProfiles() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setProfiles(data || []);
    }

    setLoading(false);
  }

  async function updateStatus(id: string, status: "active" | "rejected" | "suspended") {
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", id);

    if (!error) {
      await loadProfiles();
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return profiles;

    return profiles.filter((profile) =>
      [
        profile.full_name,
        profile.email,
        profile.role,
        profile.status,
        profile.school_name,
        profile.region,
        profile.mobile,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [profiles, query]);

  const stats = {
    total: profiles.length,
    pending: profiles.filter((p) => p.status === "pending").length,
    active: profiles.filter((p) => p.status === "active").length,
    teachers: profiles.filter((p) => p.role === "teacher_male" || p.role === "teacher_female").length,
    counselors: profiles.filter((p) => p.role === "counselor_male" || p.role === "counselor_female").length,
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#f6f8fb] p-4 text-slate-950 md:p-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black text-teal-700">لوحة مدير النظام</p>
              <h1 className="mt-2 text-3xl font-black">إدارة المستخدمين وطلبات الانضمام</h1>
              <p className="mt-2 text-sm font-bold text-slate-500">
                موافقة، رفض، تعليق، ومتابعة بيانات المستخدمين في منصة بصيرة.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
              <ShieldCheck size={18} />
              صلاحيات المدير
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          <Stat title="إجمالي المستخدمين" value={stats.total} />
          <Stat title="قيد المراجعة" value={stats.pending} />
          <Stat title="مفعّلون" value={stats.active} />
          <Stat title="معلمون ومعلمات" value={stats.teachers} />
          <Stat title="مرشدون ومرشدات" value={stats.counselors} />
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بالاسم، البريد، المدرسة، المنطقة، الجوال..."
              className="w-full bg-transparent text-sm font-bold outline-none"
            />
          </div>

          {loading ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-black text-slate-500">
              جارٍ تحميل المستخدمين...
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-right text-sm">
                  <thead className="bg-slate-50 text-xs font-black text-slate-500">
                    <tr>
                      <th className="p-4">المستخدم</th>
                      <th className="p-4">الصفة</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">المدرسة</th>
                      <th className="p-4">المنطقة</th>
                      <th className="p-4">الجوال</th>
                      <th className="p-4">الإجراءات</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((profile) => (
                      <tr key={profile.id} className="bg-white">
                        <td className="p-4">
                          <div className="font-black">{profile.full_name}</div>
                          <div className="mt-1 text-xs font-bold text-slate-500">{profile.email}</div>
                        </td>

                        <td className="p-4 font-bold">{roleLabel(profile.role)}</td>

                        <td className="p-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                            {statusLabel(profile.status)}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-slate-600">{profile.school_name || "-"}</td>
                        <td className="p-4 font-bold text-slate-600">{profile.region || "-"}</td>
                        <td className="p-4 font-bold text-slate-600">{profile.mobile || "-"}</td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => updateStatus(profile.id, "active")}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100"
                            >
                              <CheckCircle2 size={14} />
                              تفعيل
                            </button>

                            <button
                              onClick={() => updateStatus(profile.id, "rejected")}
                              className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-100"
                            >
                              <XCircle size={14} />
                              رفض
                            </button>

                            <button
                              onClick={() => updateStatus(profile.id, "suspended")}
                              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
                            >
                              تعليق
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center font-black text-slate-400">
                          لا توجد نتائج مطابقة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black text-slate-500">{title}</p>
      <h2 className="mt-2 text-3xl font-black text-teal-700">{value}</h2>
    </div>
  );
}
