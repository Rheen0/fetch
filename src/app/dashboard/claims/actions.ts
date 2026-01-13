"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateClaimStatus(
  claimId: number,
  status: "approved" | "rejected",
  foundId?: number
) {
  const supabase = await createClient();

  try {
    // Update claim status
    const { error: claimError } = await supabase
      .from("claim")
      .update({ status })
      .eq("claim_id", claimId);

    if (claimError) throw claimError;

    // If approved, update found item status to claimed
    if (status === "approved" && foundId) {
      const { error: itemError } = await supabase
        .from("founditem")
        .update({ status: "claimed" })
        .eq("found_id", foundId);

      if (itemError) throw itemError;
    }

    revalidatePath("/dashboard/claims");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating claim:", error);
    return { error: error.message };
  }
}

export async function createClaim(foundId: number, studentId: number) {
  const supabase = await createClient();

  try {
    // Check if claim already exists
    const { data: existing } = await supabase
      .from("claim")
      .select("claim_id")
      .eq("found_id", foundId)
      .eq("student_id", studentId)
      .single();

    if (existing) {
      return { error: "You have already claimed this item" };
    }

    // Create new claim
    const { error } = await supabase.from("claim").insert({
      found_id: foundId,
      student_id: studentId,
      status: "pending",
      claim_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Update found item status to pending
    await supabase
      .from("founditem")
      .update({ status: "pending" })
      .eq("found_id", foundId);

    revalidatePath("/dashboard/matches");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating claim:", error);
    return { error: error.message };
  }
}
