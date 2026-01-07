import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { getStudentMatches } from "@/lib/fetchers";
import { MatchList } from "@/components/home/student/match-list";
import { EmptyState } from "@/components/home/student/empty-state";

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

  // 4. No reports
  if (matchResults.length === 0) {
    return <EmptyState type="no-reports" />;
  }

  // 5. Check if any matches exist
  const hasAnyMatches = matchResults.some((r) => r.matches.length > 0);

  if (!hasAnyMatches) {
    return <EmptyState type="no-matches" />;
  }

  // 6. Render matches
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
          <p className="mt-2 text-gray-600">
            We found potential matches for your lost items
          </p>
        </div>

        <div className="space-y-8">
          {matchResults.map((result) => (
            <MatchList key={result.report.report_id} data={result} />
          ))}
        </div>
      </div>
    </div>
  );
}
