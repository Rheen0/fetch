import Image from "next/image";
import type { MatchedFoundItem } from "@/lib/types";
import { MapPin, User, Calendar } from "lucide-react";

interface MatchCardProps {
  match: MatchedFoundItem;
  reportId: number;
}

export function MatchCard({ match, reportId }: MatchCardProps) {
  const scoreColor =
    match.match_score >= 70
      ? "text-green-600"
      : match.match_score >= 50
      ? "text-yellow-600"
      : "text-orange-600";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      {/* Match Score Badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-2xl font-bold ${scoreColor}`}>
          {match.match_score}%
        </span>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
          {match.category}
        </span>
      </div>

      {/* Image */}
      {match.image_url ? (
        <div className="relative mb-3 h-40 w-full overflow-hidden rounded-md border border-gray-200">
          <Image
            src={match.image_url}
            alt={match.item_name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="mb-3 flex h-40 w-full items-center justify-center rounded-md border border-gray-200 bg-gray-100">
          <span className="text-gray-400">No image</span>
        </div>
      )}

      {/* Item Name */}
      <h4 className="mb-2 font-semibold text-gray-900">{match.item_name}</h4>

      {/* Description */}
      {match.description && (
        <p className="mb-3 text-sm text-gray-600 line-clamp-2">
          {match.description}
        </p>
      )}

      {/* Metadata */}
      <div className="space-y-1 text-xs text-gray-500">
        {match.found_location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{match.found_location}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>Found by {match.security_name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(match.found_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action Button */}
      <button className="mt-4 w-full rounded-md bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
        Claim This Item
      </button>
    </div>
  );
}
