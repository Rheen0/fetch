import Link from "next/link";
import { SearchX, FileText } from "lucide-react";

interface EmptyStateProps {
  type: "no-reports" | "no-matches";
}

export function EmptyState({ type }: EmptyStateProps) {
  if (type === "no-reports") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <FileText className="mb-4 h-16 w-16 text-gray-400" />
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">
          No Lost Items Reported
        </h2>
        <p className="mb-6 text-center text-gray-600">
          You haven't reported any lost items yet. Report a lost item to see
          potential matches.
        </p>
        <Link
          href="/dashboard"
          className="rounded-md bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700"
        >
          Report Lost Item
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <SearchX className="mb-4 h-16 w-16 text-gray-400" />
      <h2 className="mb-2 text-2xl font-semibold text-gray-900">
        No Matches Yet
      </h2>
      <p className="mb-6 text-center text-gray-600">
        We couldn't find any matching found items yet. Check back later as new
        items are reported.
      </p>
      <Link
        href="/dashboard"
        className="rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
