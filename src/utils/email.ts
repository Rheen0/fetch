import { createClient } from "./supabase/server";
import { Resend } from "resend";

interface ClaimEmailData {
  securityEmail: string;
  securityName: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  itemName: string;
  foundLocation: string;
  foundDate: string;
  claimMessage?: string;
}

/**
 * Send email notification to security when a student claims an item
 * Uses Resend email service
 */
export async function sendClaimNotificationEmail(
  data: ClaimEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailContent = `
Dear ${data.securityName},

A student has claimed an item that you reported as found:

Item Details:
- Item Name: ${data.itemName}
- Found Location: ${data.foundLocation}
- Found Date: ${data.foundDate}

Student Information:
- Name: ${data.studentName}
- Email: ${data.studentEmail}
${data.studentPhone ? `- Phone: ${data.studentPhone}` : ''}

${data.claimMessage ? `\nStudent's Message:\n${data.claimMessage}\n` : ''}

Please coordinate with the student to return this item.

Best regards,
FETCH Lost & Found System
    `.trim();

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data: emailData, error } = await resend.emails.send({
        from: 'FETCH Lost & Found <onboarding@resend.dev>',
        to: data.securityEmail,
        subject: `Student Claim: ${data.itemName}`,
        text: emailContent,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }
    } else {
      console.warn("RESEND_API_KEY not configured, email not sent");
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending claim notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email notification to student when their claim is approved
 */
export async function sendClaimApprovedEmail(
  data: {
    studentEmail: string;
    studentName: string;
    securityName: string;
    securityEmail: string;
    itemName: string;
    foundLocation: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailContent = `
Dear ${data.studentName},

Great news! Your claim has been approved by ${data.securityName}.

Item Details:
- Item Name: ${data.itemName}
- Location: ${data.foundLocation}

Next Steps:
Please contact the security personnel to arrange pickup of your item:
- Security Contact: ${data.securityName}
- Email: ${data.securityEmail}

Thank you for using FETCH Lost & Found System!

Best regards,
FETCH Lost & Found Team
    `.trim();

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data: emailData, error } = await resend.emails.send({
        from: 'FETCH Lost & Found <onboarding@resend.dev>',
        to: data.studentEmail,
        subject: `Claim Approved: ${data.itemName}`,
        text: emailContent,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }
    } else {
      console.warn("RESEND_API_KEY not configured, email not sent");
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending approval email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get claim email data by fetching related information
 */
export async function getClaimEmailData(
  foundId: number,
  studentId: number
): Promise<ClaimEmailData | null> {
  try {
    const supabase = await createClient();

    // Get found item with security info
    const { data: foundItem, error: foundError } = await supabase
      .from("founditem")
      .select(
        `
        item_name,
        found_location,
        found_at,
        securitypersonnel (
          email,
          first_name,
          last_name
        )
      `
      )
      .eq("found_id", foundId)
      .single();

    if (foundError || !foundItem) {
      console.error("Error fetching found item:", foundError);
      return null;
    }

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from("student")
      .select("first_name, last_name, email, phone")
      .eq("student_id", studentId)
      .single();

    if (studentError || !student) {
      console.error("Error fetching student:", studentError);
      return null;
    }

    const security = Array.isArray(foundItem.securitypersonnel)
      ? foundItem.securitypersonnel[0]
      : foundItem.securitypersonnel;

    if (!security) {
      console.error("No security personnel found");
      return null;
    }

    return {
      securityEmail: security.email,
      securityName: `${security.first_name} ${security.last_name}`,
      studentName: `${student.first_name} ${student.last_name}`,
      studentEmail: student.email,
      studentPhone: student.phone,
      itemName: foundItem.item_name,
      foundLocation: foundItem.found_location,
      foundDate: new Date(foundItem.found_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };
  } catch (error) {
    console.error("Error getting claim email data:", error);
    return null;
  }
}
