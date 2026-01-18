import Image from "next/image";
import type { LostItemReport } from "@/lib/types";
import { Calendar, Tag, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LostItemCardProps {
  report: LostItemReport;
}

export function LostItemCard({ report }: LostItemCardProps) {
  return (
    <div className="flex gap-4">
      {report.image_url ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200">
          <Image
            src={report.image_url}
            alt={report.item_name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
          <Tag className="h-8 w-8 text-gray-300" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">{report.item_name}</h2>
          <Badge variant="outline" className="shrink-0 text-xs">
            {report.status}
          </Badge>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            <span className="capitalize">{report.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(report.reported_at).toLocaleDateString()}</span>
          </div>
          {report.last_seen_location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[150px]">{report.last_seen_location}</span>
            </div>
          )}
        </div>

        {report.description && (
          <p className="mt-2 text-xs text-gray-600 line-clamp-2">
            {report.description}
          </p>
        )}
      </div>
    </div>
  );
}
