"use client";

import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function DeleteAnalysisRecordButton({
  recordId,
  reportTitle,
  onDeleted,
}: {
  recordId: string;
  reportTitle?: string | null;
  onDeleted?: () => void;
}) {
  async function handleDelete() {
    const confirmed = window.confirm(
      `هل تريد حذف هذا التقرير؟\n\n${reportTitle || "تقرير تحليل النتائج"}`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("analysis_records")
      .delete()
      .eq("id", recordId);

    if (error) {
      alert(`تعذر حذف التقرير: ${error.message}`);
      return;
    }

    onDeleted?.();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100"
    >
      <Trash2 size={15} />
      حذف
    </button>
  );
}
