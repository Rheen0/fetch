import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { getStudentMatches } from "@/lib/fetchers";
import { MatchesClient } from "@/components/matches/matches-client";

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function MatchesPage() {
  // 1. Auth check
  const { user, profile, error } = await getCachedUserData();

  if (error || !user || !profile) {
    redirect("/login");
  }

  // 2. Student-only access
  if (profile.user_type !== "student" || !profile.studentId) {
    redirect("/dashboard");
  }

  // 3. Get student's matches
  const matchResults = await getStudentMatches(profile.studentId);

  // 4. Determine state
  const hasNoReports = matchResults.length === 0;
  const hasNoMatches = !hasNoReports && matchResults.every((r) => r.matches.length === 0);

  return (
    <MatchesClient
      studentId={profile.studentId}
      matchResults={matchResults}
      hasNoReports={hasNoReports}
      hasNoMatches={hasNoMatches}
    />
  );
}
