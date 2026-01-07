import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { StudentReports } from "@/components/reports/student-reports";

export default async function ReportsPage() {
  const { user, profile, error } = await getCachedUserData();

  if (error || !user || !profile) {
    redirect("/login");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  // Only students can access this page
  if (profile.user_type !== "student") {
    redirect("/dashboard");
  }

  return <StudentReports studentId={profile.studentId || 0} />;
}
