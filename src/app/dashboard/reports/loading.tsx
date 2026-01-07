import { StudentLayout } from "@/components/layouts/student-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StatsSkeleton } from "@/components/skeletons/stats-skeleton";
import { ReportListSkeleton } from "@/components/skeletons/report-card-skeleton";

export default function ReportsLoading() {
  return (
    <StudentLayout currentPath="reports">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-fetch-red">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <StatsSkeleton />
        <div className="mt-6">
          <ReportListSkeleton />
        </div>
      </div>
    </StudentLayout>
  );
}
