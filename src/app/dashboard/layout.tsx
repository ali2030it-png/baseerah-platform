import type { ReactNode } from "react";
import { BasirahShell } from "@/components/basirah/BasirahShell";
import { AuthLogoutButton } from "@/components/basirah/AuthLogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <BasirahShell>{children}</BasirahShell>

      <div className="fixed bottom-24 left-5 z-[60] print:hidden">
        <AuthLogoutButton />
      </div>
    </>
  );
}
