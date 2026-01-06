"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const userId = formData.get("userId") as string;
  const userType = formData.get("userType") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const avatarUrl = formData.get("avatarUrl") as string | null;

  // Get user email
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email;

  if (!email) {
    return { error: "User email not found" };
  }

  // Build profile data
  const profileData: any = {
    first_name: firstName,
    last_name: lastName,
    phone: phone || null,
  };

  // Add avatar URL if provided
  if (avatarUrl) {
    profileData.avatar_url = avatarUrl;
  }

  // Add type-specific fields and update legacy tables
  if (userType === "student") {
    const studentNumber = formData.get("studentNumber") as string;
    profileData.student_number = studentNumber;

    // Update student table (lowercase)
    const { error: studentError } = await supabase
      .from("student")
      .update({
        student_number: studentNumber,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      })
      .eq("email", email);

    if (studentError) {
      console.error("Student table update error:", studentError);
      return {
        error: "Failed to update student record: " + studentError.message,
      };
    }
  } else if (userType === "security") {
    const employeeId = formData.get("employeeId") as string;
    const department = formData.get("department") as string;
    const employmentDate = formData.get("employmentDate") as string;

    profileData.employee_id = employeeId;
    profileData.department = department || null;
    profileData.employment_date = employmentDate;

    // Update securitypersonnel table (lowercase)
    const { error: securityError } = await supabase
      .from("securitypersonnel")
      .update({
        employee_id: employeeId,
        first_name: firstName,
        last_name: lastName,
        department: department || null,
        employment_date: employmentDate,
      })
      .eq("email", email);

    if (securityError) {
      console.error("SecurityPersonnel table update error:", securityError);
      return {
        error: "Failed to update security record: " + securityError.message,
      };
    }
  }

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId);

  if (error) {
    console.error("Profile update error:", error);
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/dashboard");
  return { success: true };
}