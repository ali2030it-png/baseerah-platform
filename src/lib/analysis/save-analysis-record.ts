import { ParsedAssessmentRow } from "@/lib/analysis/excel-parser";
import type { AssessmentMetadata } from "@/lib/analysis/assessment-metadata";
import { buildAnalysisRecordPayload } from "@/lib/analysis/analysis-records";
import { supabase } from "@/lib/supabase/client";

type SaveAnalysisRecordInput = {
  userId: string;
  rows: ParsedAssessmentRow[];
  analysis: any;
  metadata: AssessmentMetadata;
};

type SaveStatus = "created" | "updated" | "unchanged";

export async function saveAnalysisRecordToDatabase({
  userId,
  rows,
  analysis,
  metadata,
}: SaveAnalysisRecordInput): Promise<{
  status: SaveStatus;
  id: string | null;
}> {
  const payload = buildAnalysisRecordPayload({
    userId,
    rows,
    analysis,
    metadata,
  });

  const { data: existingRecord, error: lookupError } = await supabase
    .from("analysis_records")
    .select("id,content_hash")
    .eq("user_id", userId)
    .eq("record_fingerprint", payload.record_fingerprint)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existingRecord?.id) {
    if (existingRecord.content_hash === payload.content_hash) {
      return {
        status: "unchanged",
        id: existingRecord.id,
      };
    }

    const { user_id, record_fingerprint, ...updatePayload } = payload;

    const { data: updated, error: updateError } = await supabase
      .from("analysis_records")
      .update(updatePayload)
      .eq("id", existingRecord.id)
      .eq("user_id", userId)
      .select("id")
      .single();

    if (updateError) {
      throw updateError;
    }

    return {
      status: "updated",
      id: updated?.id || existingRecord.id,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("analysis_records")
    .insert(payload)
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: conflictRecord, error: conflictLookupError } = await supabase
        .from("analysis_records")
        .select("id")
        .eq("user_id", userId)
        .eq("record_fingerprint", payload.record_fingerprint)
        .maybeSingle();

      if (conflictLookupError) {
        throw conflictLookupError;
      }

      const { user_id, record_fingerprint, ...updatePayload } = payload;

      const { data: updated, error: updateError } = await supabase
        .from("analysis_records")
        .update(updatePayload)
        .eq("id", conflictRecord?.id)
        .eq("user_id", userId)
        .select("id")
        .single();

      if (updateError) {
        throw updateError;
      }

      return {
        status: "updated",
        id: updated?.id || conflictRecord?.id || null,
      };
    }

    throw insertError;
  }

  return {
    status: "created",
    id: inserted?.id || null,
  };
}
