import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { getStudentMatches } from "@/lib/fetchers";
import { MatchesClient } from "@/components/matches/matches-client";

// Disable caching for immediate updates
export const revalidate = 0;

export default async function MatchesPage() {
  // 1. Auth check
  const { user, profile, error } = await getCachedUserData();

  if (error || !user || !profile) {
    redirect("/login");
  }

  // 2. Student-only access
  if (profile.user_type !== "student") {
    redirect("/dashboard");
  }
  
  // 3. Extract studentId and validate
  const studentId = profile.studentId;
  
  if (!studentId) {
    redirect("/student-record-missing");
  }

  // 4. Get student's matches
  const matchResults = await getStudentMatches(studentId);

  // 5. Determine state
  const hasNoReports = matchResults.length === 0;
  const hasNoMatches = !hasNoReports && matchResults.every((r) => r.matches.length === 0);

  return (
    <MatchesClient
      studentId={studentId}
      matchResults={matchResults}
      hasNoReports={hasNoReports}
      hasNoMatches={hasNoMatches}
      firstName={profile.first_name}
      avatarUrl={profile.avatar_url}
    />
  );
}
