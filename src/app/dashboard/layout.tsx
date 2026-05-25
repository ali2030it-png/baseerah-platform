import { AuthGuard } from "@/components/auth/AuthGuard";
import { BasirahShell } from "@/components/basirah/BasirahShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <BasirahShell>{children}</BasirahShell>
    </AuthGuard>
  );
}
