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
