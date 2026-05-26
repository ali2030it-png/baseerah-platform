export type UserRole =
  | "super_admin"
  | "teacher_male"
  | "teacher_female"
  | "counselor_male"
  | "counselor_female";

export type UserStatus =
  | "pending"
  | "active"
  | "rejected"
  | "suspended";

export function roleLabel(role?: string) {
  if (role === "super_admin") return "مدير عام النظام";
  if (role === "teacher_male") return "معلم";
  if (role === "teacher_female") return "معلمة";
  if (role === "counselor_male") return "مرشد طلابي";
  if (role === "counselor_female") return "مرشدة طلابية";
  return "مستخدم";
}

export function statusLabel(status?: string) {
  if (status === "pending") return "قيد المراجعة";
  if (status === "active") return "مفعّل";
  if (status === "rejected") return "مرفوض";
  if (status === "suspended") return "معطّل";
  return "غير معروف";
}
