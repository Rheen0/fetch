import type { LostItemWithMatches } from "@/lib/types";
import { LostItemCard } from "./lost-item-card";
import { MatchCard } from "./match-card";

interface MatchListProps {
  data: LostItemWithMatches;
}

export function MatchList({ data }: MatchListProps) {
  const { report, matches } = data;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <LostItemCard report={report} />

      <div className="mt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Potential Matches ({matches.length})
        </h3>

        {matches.length === 0 ? (
          <p className="text-gray-500">No matches found for this item yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard
                key={match.found_id}
                match={match}
                reportId={report.report_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
