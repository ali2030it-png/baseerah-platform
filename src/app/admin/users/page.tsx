"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { roleLabel, statusLabel } from "@/lib/auth/roles";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  mobile: string | null;
  region: string | null;
  school_name: string | null;
  created_at: string | null;
};

const statusActions = [
  { value: "active", label: "تفعيل" },
  { value: "suspended", label: "تعطيل" },
  { value: "rejected", label: "رفض" },
  { value: "pending", label: "إعادة للمراجعة" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("profiles")
      .select("id,full_name,email,role,status,mobile,region,school_name,created_at")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setUsers(data || []);
  }

  async function updateStatus(id: string, status: string) {
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, status } : user
      )
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!text) return users;

    return users.filter((user) => {
      return [
        user.full_name,
        user.email,
        user.mobile,
        user.region,
        user.school_name,
        roleLabel(user.role || ""),
        statusLabel(user.status || ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text);
    });
  }, [users, query]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      pending: users.filter((user) => user.status === "pending").length,
      active: users.filter((user) => user.status === "active").length,
      suspended: users.filter((user) => user.status === "suspended").length,
      rejected: users.filter((user) => user.status === "rejected").length,
    };
  }, [users]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-teal-700">
                لوحة مدير النظام
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-950">
                إدارة المستخدمين وطلبات الانضمام
              </h1>

              <p className="mt-2 text-sm font-bold text-slate-500">
                مراجعة الحسابات، تفعيلها، تعطيلها، أو رفض طلبات الانضمام.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
              <ShieldCheck size={18} />
              صلاحيات المدير العام
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <Stat title="إجمالي المستخدمين" value={stats.total} />
          <Stat title="قيد المراجعة" value={stats.pending} />
          <Stat title="مفعّلون" value={stats.active} />
          <Stat title="معطّلون" value={stats.suspended} />
          <Stat title="مرفوضون" value={stats.rejected} />
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بالاسم، البريد، المدرسة، المنطقة، الجوال..."
              className="h-14 flex-1 bg-transparent text-sm font-bold outline-none"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 p-8 text-center text-sm font-black text-slate-400">
              جارٍ تحميل المستخدمين...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[1100px] text-right text-sm">
                <thead className="bg-slate-50 text-xs font-black text-slate-500">
                  <tr>
                    <th className="p-4">المستخدم</th>
                    <th className="p-4">البريد</th>
                    <th className="p-4">الصفة</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">الجوال</th>
                    <th className="p-4">المنطقة</th>
                    <th className="p-4">المدرسة</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="p-4 font-black">
                        {user.full_name || "-"}
                      </td>

                      <td className="p-4 font-bold">
                        {user.email || "-"}
                      </td>

                      <td className="p-4">
                        {roleLabel(user.role || "")}
                      </td>

                      <td className="p-4">
                        <StatusBadge status={user.status || ""} />
                      </td>

                      <td className="p-4">
                        {user.mobile || "-"}
                      </td>

                      <td className="p-4">
                        {user.region || "-"}
                      </td>

                      <td className="p-4">
                        {user.school_name || "-"}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {statusActions.map((action) => (
                            <button
                              key={action.value}
                              type="button"
                              onClick={() => updateStatus(user.id, action.value)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-8 text-center font-black text-slate-400"
                      >
                        لا توجد نتائج مطابقة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-teal-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = statusLabel(status);

  const className =
    status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "pending"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : status === "suspended"
      ? "border-slate-200 bg-slate-50 text-slate-600"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${className}`}>
      {label}
    </span>
  );
}
