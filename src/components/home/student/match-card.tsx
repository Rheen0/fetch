"use client";

import { useState } from "react";
import Image from "next/image";
import type { MatchedFoundItem } from "@/lib/types";
import { MapPin, User, Calendar, Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClaim } from "@/app/dashboard/claims/actions";
import { toast } from "sonner";

interface MatchCardProps {
  match: MatchedFoundItem;
  reportId: number;
  studentId: number;
}

export function MatchCard({ match, reportId, studentId }: MatchCardProps) {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);

    try {
      const result = await createClaim(match.found_id, studentId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Claim submitted! Security will verify your request.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      toast.error("Failed to submit claim. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-lg hover:border-fetch-red/30">
      <div className="p-4">
        {/* Image */}
        {match.image_url ? (
          <div className="relative mb-3 h-36 w-full overflow-hidden rounded-lg">
            <Image
              src={match.image_url}
              alt={match.item_name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="mb-3 flex h-36 w-full items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* Item Name & Category */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{match.item_name}</h4>
            <Badge className="bg-fetch-yellow text-gray-900 hover:bg-fetch-yellow shrink-0 text-xs">
              {match.match_score}% match
            </Badge>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {match.category}
          </Badge>
        </div>

        {/* Description */}
        {match.description && (
          <p className="mb-3 text-xs text-gray-600 line-clamp-2 min-h-[2.5rem]">
            {match.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-1.5 mb-3 text-xs text-gray-500">
          {match.found_location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{match.found_location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="truncate">Found by {match.security_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span>{new Date(match.found_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full bg-fetch-red hover:bg-fetch-red/90 text-sm"
          size="sm"
        >
          {claiming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Claiming...
            </>
          ) : (
            "Claim This Item"
          )}
        </Button>
      </div>
    </div>
  );
}
