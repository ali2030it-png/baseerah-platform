import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/basirah/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f7fb]">
      <AdminSidebar />

      <div className="min-h-screen lg:pr-72">
        {children}
      </div>
    </div>
  );
}
