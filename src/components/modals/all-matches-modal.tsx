"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { MapPin, Calendar, User } from "lucide-react";
import type { MatchedFoundItem } from "@/lib/types";

interface AllMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lostItemName: string;
  matches: MatchedFoundItem[];
}

export function AllMatchesModal({
  isOpen,
  onClose,
  lostItemName,
  matches,
}: AllMatchesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>All Matches for &quot;{lostItemName}&quot;</DialogTitle>
          <p className="text-sm text-gray-500">
            {matches.length} potential {matches.length === 1 ? "match" : "matches"} found
          </p>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {matches
              .sort((a, b) => b.match_score - a.match_score)
              .map((match) => (
                <MatchDetailCard key={match.found_id} match={match} />
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface MatchDetailCardProps {
  match: MatchedFoundItem;
}

function MatchDetailCard({ match }: MatchDetailCardProps) {
  const foundDate = new Date(match.found_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const scoreColor =
    match.match_score >= 70
      ? "bg-green-100 text-green-700 border-green-200"
      : match.match_score >= 50
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-orange-100 text-orange-700 border-orange-200";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">

          <div className="flex-shrink-0">
            {match.image_url ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={match.image_url}
                  alt={match.item_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {match.item_name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {match.category}
                </Badge>
              </div>
              <div className={`${scoreColor} px-3 py-1.5 rounded-full border`}>
                <span className="text-sm font-bold">{match.match_score}%</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{match.found_location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Found on {foundDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>Reported by {match.security_name}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <button className="text-sm text-fetch-red hover:text-fetch-red/80 font-medium">
                Claim This Item →
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}