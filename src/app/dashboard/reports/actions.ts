"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function cancelLostReport(reportId: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("lostitemreport")
      .update({ status: "closed" })
      .eq("report_id", reportId);

    if (error) {
      console.error("Error canceling report:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error canceling report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function reactivateLostReport(reportId: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("lostitemreport")
      .update({ status: "active" })
      .eq("report_id", reportId);

    if (error) {
      console.error("Error reactivating report:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error reactivating report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteLostReport(reportId: number) {
  try {
    const supabase = await createClient();

    // Delete associated matches first
    const { error: matchError } = await supabase
      .from("match")
      .delete()
      .eq("report_id", reportId);

    if (matchError) {
      console.error("Error deleting matches:", matchError);
      return { success: false, error: matchError.message };
    }

    // Delete the report
    const { error } = await supabase
      .from("lostitemreport")
      .delete()
      .eq("report_id", reportId);

    if (error) {
      console.error("Error deleting report:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface UpdateLostReportData {
  reportId: number;
  item_name: string;
  description: string;
  category: string;
  last_seen_location: string;
  image_url: string;
}

export async function updateLostReport(data: UpdateLostReportData) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("lostitemreport")
      .update({
        item_name: data.item_name,
        description: data.description,
        category: data.category,
        last_seen_location: data.last_seen_location,
        image_url: data.image_url,
      })
      .eq("report_id", data.reportId);

    if (error) {
      console.error("Error updating report:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
