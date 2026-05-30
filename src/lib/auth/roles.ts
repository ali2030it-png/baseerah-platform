export type UserRole =
  | "super_admin"
  | "school_principal_male"
  | "school_principal_female"
  | "teacher_male"
  | "teacher_female"
  | "counselor_male"
  | "counselor_female";

export type UserStatus = "pending" | "active" | "suspended" | "rejected";

export function roleLabel(role?: string | null) {
  if (role === "super_admin") return "مدير النظام";
  if (role === "school_principal_male") return "مدير مدرسة";
  if (role === "school_principal_female") return "مديرة مدرسة";
  if (role === "teacher_male") return "معلم";
  if (role === "teacher_female") return "معلمة";
  if (role === "counselor_male") return "موجه طلابي";
  if (role === "counselor_female") return "موجهة طلابية";

  return "غير محدد";
}

export function statusLabel(status?: string | null) {
  if (status === "active") return "نشط";
  if (status === "pending") return "بانتظار الموافقة";
  if (status === "suspended") return "موقوف";
  if (status === "rejected") return "مرفوض";

  return "غير محدد";
}
