import type { ReactNode } from "react";
import { BasirahShell } from "@/components/basirah/BasirahShell";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <BasirahShell>{children}</BasirahShell>;
}
