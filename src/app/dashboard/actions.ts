"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { processNewLostItemMatches } from "@/lib/matcher";
import type { LostItemReport } from "@/lib/types";

export async function reportLostItem(formData: {
  studentId: number;
  item_name: string;
  description: string;
  category: string;
  last_seen_location: string;
  image_url: string;
}) {
  try {
    const supabase = await createClient();

    // Insert lost item report
    const { data: newReport, error: insertError } = await supabase
      .from("lostitemreport")
      .insert({
        student_id: formData.studentId,
        item_name: formData.item_name,
        description: formData.description || null,
        category: formData.category,
        last_seen_location: formData.last_seen_location || null,
        image_url: formData.image_url || null,
        status: "active",
        reported_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return { success: false, error: insertError.message };
    }

    if (!newReport) {
      return { success: false, error: "Failed to create report" };
    }

    // Trigger matching process
    const lostItem: LostItemReport = {
      report_id: newReport.report_id,
      student_id: newReport.student_id,
      item_name: newReport.item_name,
      description: newReport.description,
      image_url: newReport.image_url,
      category: newReport.category,
      status: newReport.status,
      reported_at: newReport.reported_at,
      last_seen_location: newReport.last_seen_location,
    };

    // Process matches (don't await - run in background)
    processNewLostItemMatches(newReport.report_id, lostItem).catch((error) => {
      console.error("Error processing matches:", error);
    });

    // Revalidate the dashboard
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/matches");

    return { success: true, reportId: newReport.report_id };
  } catch (error) {
    console.error("Error reporting lost item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
