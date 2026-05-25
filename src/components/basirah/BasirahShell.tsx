import { BasirahSidebar } from "./BasirahSidebar";
import { BasirahTopbar } from "./BasirahTopbar";
import { BasirahMobileNav } from "./BasirahMobileNav";

export function BasirahShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f6f8fb] text-slate-950"
    >
      <BasirahTopbar />

      <div className="mx-auto flex max-w-[1600px] gap-5 px-4 pb-24 pt-4 lg:pb-6">
        <BasirahSidebar />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <BasirahMobileNav />
    </div>
  );
}
