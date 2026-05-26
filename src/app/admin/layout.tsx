import type { ReactNode } from "react";
import { AuthLogoutButton } from "@/components/basirah/AuthLogoutButton";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AuthLogoutButton />
      {children}
    </>
  );
}
