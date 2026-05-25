import { BasirahShell } from "@/components/basirah/BasirahShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BasirahShell>
      {children}
    </BasirahShell>
  );
}
