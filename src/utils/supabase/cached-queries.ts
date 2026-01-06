import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

export const getCachedProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { profile, error };
});

export const getCachedStudentId = cache(async (email: string) => {
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("student")
    .select("student_id")
    .eq("email", email)
    .maybeSingle();
  return student?.student_id;
});

export const getCachedSecurityId = cache(async (email: string) => {
  const supabase = await createClient();
  const { data: security } = await supabase
    .from("securitypersonnel")
    .select("security_id")
    .eq("email", email)
    .maybeSingle();
  return security?.security_id;
});

// Get complete user data in one call
export const getCachedUserData = cache(async () => {
  const { user, error: authError } = await getCachedUser();
  
  if (authError || !user) {
    return { user: null, profile: null, error: authError };
  }

  const { profile, error: profileError } = await getCachedProfile(user.id);

  if (profileError || !profile) {
    return { user, profile: null, error: profileError };
  }

  // Get role-specific IDs if needed
  let studentId: number | undefined;
  let securityId: number | undefined;

  if (profile.user_type === "student") {
    studentId = await getCachedStudentId(user.email || "");
  } else if (profile.user_type === "security") {
    securityId = await getCachedSecurityId(user.email || "");
  }

  return {
    user,
    profile: {
      ...profile,
      studentId,
      securityId,
    },
    error: null,
  };
});
