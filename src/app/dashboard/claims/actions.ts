"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  sendClaimNotificationEmail,
  getClaimEmailData,
  sendClaimApprovedEmail,
} from "@/utils/email";

export async function updateClaimStatus(
  claimId: number,
  status: "approved" | "rejected",
  foundId?: number
) {
  const supabase = await createClient();

  try {
    // Get claim details first for notifications
    const { data: claim, error: claimFetchError } = await supabase
      .from("claim")
      .select(
        `
        claim_id,
        student_id,
        found_id,
        student:student_id (
          student_id,
          first_name,
          last_name,
          email
        ),
        founditem:found_id (
          item_name,
          found_location,
          security_id,
          securitypersonnel:security_id (
            first_name,
            last_name,
            email
          )
        )
      `
      )
      .eq("claim_id", claimId)
      .single();

    if (claimFetchError || !claim) {
      throw new Error("Could not fetch claim details");
    }

    // Update claim status
    const { error: claimError } = await supabase
      .from("claim")
      .update({ status })
      .eq("claim_id", claimId);

    if (claimError) throw claimError;

    // Update found item status based on claim status
    if (foundId) {
      if (status === "approved") {
        // Mark as returned when approved
        const { error: itemError } = await supabase
          .from("founditem")
          .update({ status: "returned" })
          .eq("found_id", foundId);

        if (itemError) throw itemError;

        // Close the lost item report
        const student = Array.isArray(claim.student) ? claim.student[0] : claim.student;
        if (student) {
          // Find the report through the match table
          const { data: matchData } = await supabase
            .from("match")
            .select("report_id")
            .eq("found_id", foundId)
            .limit(1)
            .maybeSingle();

          if (matchData?.report_id) {
            console.log("Closing lost item report:", matchData.report_id);
            const { error: reportError } = await supabase
              .from("lostitemreport")
              .update({ status: "closed" })
              .eq("report_id", matchData.report_id)
              .eq("student_id", student.student_id);

            if (reportError) {
              console.error("Error closing report:", reportError);
            } else {
              console.log("Lost item report closed successfully");
            }
          }
        }

        // Send approval email to student
        const founditem = Array.isArray(claim.founditem) ? claim.founditem[0] : claim.founditem;
        const security = founditem?.securitypersonnel;
        const securityData = Array.isArray(security) ? security[0] : security;

        if (student && founditem && securityData) {
          console.log("Sending approval email to student...");
          await sendClaimApprovedEmail({
            studentEmail: student.email,
            studentName: `${student.first_name} ${student.last_name}`,
            securityName: `${securityData.first_name} ${securityData.last_name}`,
            securityEmail: securityData.email,
            itemName: founditem.item_name,
            foundLocation: founditem.found_location || "Unknown",
          });

          // Create notification for student
          console.log("Creating student notification...");
          const { error: notifError } = await supabase
            .from("notification")
            .insert({
              student_id: student.student_id,
              message: `Your claim for "${founditem.item_name}" has been approved! Contact ${securityData.first_name} ${securityData.last_name} to arrange pickup.`,
              is_read: false,
            });

          if (notifError) {
            console.error("Error creating student notification:", notifError);
          } else {
            console.log("Student notification created successfully");
          }
        }
      } else if (status === "rejected") {
        // Return to pending when rejected so it can be claimed by others
        const { error: itemError } = await supabase
          .from("founditem")
          .update({ status: "pending" })
          .eq("found_id", foundId);

        if (itemError) throw itemError;

        // Optionally notify student of rejection
        const student = Array.isArray(claim.student) ? claim.student[0] : claim.student;
        const founditem = Array.isArray(claim.founditem) ? claim.founditem[0] : claim.founditem;

        if (student && founditem) {
          const { error: notifError } = await supabase
            .from("notification")
            .insert({
              student_id: student.student_id,
              message: `Your claim for "${founditem.item_name}" was not approved. The item is available for other claims.`,
              is_read: false,
            });

          if (notifError) {
            console.error("Error creating rejection notification:", notifError);
          }
        }
      }
    }

    revalidatePath("/dashboard/claims");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating claim:", error);
    return { error: error.message };
  }
}

export async function createClaim(foundId: number, studentId: number) {
  const supabase = await createClient();

  try {
    console.log("Creating claim for:", { foundId, studentId });

    // First, get the found item details including security_id
    const { data: foundItem, error: foundError } = await supabase
      .from("founditem")
      .select("security_id, item_name, status")
      .eq("found_id", foundId)
      .single();

    if (foundError) {
      console.error("Error fetching found item:", foundError);
      throw foundError;
    }

    if (!foundItem) {
      throw new Error("Found item not found");
    }

    if (foundItem.status !== "pending") {
      return { error: "This item is no longer available for claiming" };
    }

    console.log("Found item details:", foundItem);

    // Check if claim already exists
    const { data: existing, error: existingError } = await supabase
      .from("claim")
      .select("claim_id")
      .eq("found_id", foundId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing claim:", existingError);
      throw existingError;
    }

    if (existing) {
      return { error: "You have already claimed this item" };
    }

    // Create new claim with security_id
    const { data: newClaim, error: claimError } = await supabase
      .from("claim")
      .insert({
        found_id: foundId,
        student_id: studentId,
        security_id: foundItem.security_id,
        status: "pending",
        claimed_at: new Date().toISOString(),
      })
      .select("claim_id")
      .single();

    if (claimError) {
      console.error("Error inserting claim:", claimError);
      throw claimError;
    }

    console.log("Claim created:", newClaim);

    // Update found item status to claimed
    console.log("Updating found item status to 'claimed'...");
    const { error: updateError } = await supabase
      .from("founditem")
      .update({ status: "claimed" })
      .eq("found_id", foundId);

    if (updateError) {
      console.error("Error updating found item status:", updateError);
    } else {
      console.log("Found item status updated to 'claimed'");
    }

    // Send email notification to security personnel
    const emailData = await getClaimEmailData(foundId, studentId);
    if (emailData) {
      console.log("Sending email notification...");
      await sendClaimNotificationEmail(emailData);

      // Create in-app notification for security
      if (foundItem && newClaim) {
        console.log("Creating security notification...");
        const { error: notifError } = await supabase
          .from("securitynotifications")
          .insert({
            security_id: foundItem.security_id,
            claim_id: newClaim.claim_id,
            found_id: foundId,
            message: `A student has claimed your found item: ${foundItem.item_name}`,
            is_read: false,
          });

        if (notifError) {
          console.error("Error creating notification:", notifError);
        } else {
          console.log("Security notification created successfully");
        }
      }
    }

    revalidatePath("/dashboard/matches");
    revalidatePath("/dashboard/claims");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating claim:", error);
    return { error: error.message || "Failed to create claim" };
  }
}
