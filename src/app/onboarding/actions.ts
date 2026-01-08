"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();

  const userId = formData.get("userId") as string;
  const userType = formData.get("userType") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

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
    id: userId,
    user_type: userType,
    first_name: firstName,
    last_name: lastName,
    phone: phone || null,
    onboarding_completed: true,
  };

  // Add type-specific fields and populate legacy tables
  if (userType === "student") {
    const studentNumber = formData.get("studentNumber") as string;
    profileData.student_number = studentNumber;

    // Insert into Student table
    const { error: studentError } = await supabase.from("student").insert({
      student_number: studentNumber,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone || null,
    });

    if (studentError) {
      console.error("Student table insert error:", studentError);
      return {
        error: "Failed to create student record: " + studentError.message,
      };
    }
  } else if (userType === "security") {
    const employeeId = formData.get("employeeId") as string;
    const department = formData.get("department") as string;
    const employmentDate = formData.get("employmentDate") as string;

    profileData.employee_id = employeeId;
    profileData.department = department || null;
    profileData.employment_date = employmentDate;

    // Insert into SecurityPersonnel table
    const { error: securityError } = await supabase
      .from("securitypersonnel")
      .insert({
        employee_id: employeeId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        department: department || null,
        employment_date: employmentDate,
      });

    if (securityError) {
      console.error("SecurityPersonnel table insert error:", securityError);
      return {
        error: "Failed to create security record: " + securityError.message,
      };
    }
  }

  // Insert or update profile
  const { error } = await supabase.from("profiles").upsert(profileData, {
    onConflict: "id",
  });

  if (error) {
    console.error("Onboarding error:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
