import type { LostItemWithMatches } from "@/lib/types";
import { LostItemCard } from "./lost-item-card";
import { MatchCard } from "./match-card";
import { Sparkles } from "lucide-react";

interface MatchListProps {
  data: LostItemWithMatches;
}

export function MatchList({ data }: MatchListProps) {
  const { report, matches, studentId } = data;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b">
        <LostItemCard report={report} />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-fetch-red" />
          <h3 className="text-base font-semibold text-gray-900">
            {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
          </h3>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">No matches found for this item yet.</p>
            <p className="text-xs text-gray-400 mt-1">We'll notify you when new items are found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard
                key={match.found_id}
                match={match}
                reportId={report.report_id}
                studentId={studentId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
