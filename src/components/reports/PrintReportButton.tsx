"use client";

export function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
    >
      طباعة التقرير
    </button>
  );
}
