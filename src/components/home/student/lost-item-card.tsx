import Image from "next/image";
import type { LostItemReport } from "@/lib/types";
import { Calendar, Tag } from "lucide-react";

interface LostItemCardProps {
  report: LostItemReport;
}

export function LostItemCard({ report }: LostItemCardProps) {
  return (
    <div className="flex gap-4">
      {report.image_url ? (
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
          <Image
            src={report.image_url}
            alt={report.item_name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
          <Tag className="h-8 w-8 text-gray-400" />
        </div>
      )}

      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900">{report.item_name}</h2>

        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span className="capitalize">{report.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(report.reported_at).toLocaleDateString()}</span>
          </div>
        </div>

        {report.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {report.description}
          </p>
        )}
      </div>
    </div>
  );
}
