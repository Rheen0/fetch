"use client";

import { useState } from "react";
import { StudentLayout } from "@/components/layouts/student-layout";
import { ReportLostModal } from "@/components/modals/report-lost-modal";
import { MatchList } from "@/components/home/student/match-list";
import { EmptyState } from "@/components/home/student/empty-state";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import type { LostItemWithMatches } from "@/lib/types";

interface MatchesClientProps {
  studentId: number;
  matchResults: LostItemWithMatches[];
  hasNoReports: boolean;
  hasNoMatches: boolean;
  firstName: string;
  avatarUrl?: string | null;
}

export function MatchesClient({
  studentId,
  matchResults,
  hasNoReports,
  hasNoMatches,
  firstName,
  avatarUrl,
}: MatchesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (hasNoReports) {
    return (
      <StudentLayout 
        onReportClick={() => setIsModalOpen(true)}
        currentPath="dashboard"
      >
        <EmptyState type="no-reports" />
        {isModalOpen && (
          <ReportLostModal
            studentId={studentId}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </StudentLayout>
    );
  }

  if (hasNoMatches) {
    return (
      <StudentLayout 
        onReportClick={() => setIsModalOpen(true)}
        currentPath="dashboard"
      >
        <EmptyState type="no-matches" />
        {isModalOpen && (
          <ReportLostModal
            studentId={studentId}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </StudentLayout>
    );
  }

  const totalMatches = matchResults.reduce((sum, r) => sum + r.matches.length, 0);

  return (
    <StudentLayout 
      onReportClick={() => setIsModalOpen(true)}
      currentPath="dashboard"
    >
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-fetch-red" />
                  Your Matches
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {totalMatches} potential {totalMatches === 1 ? 'match' : 'matches'} found
                </p>
              </div>
            </div>
            <NotificationDropdown
              userId={studentId}
              userType="student"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {matchResults.map((result) => (
            <MatchList key={result.report.report_id} data={result} />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <ReportLostModal
          studentId={studentId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </StudentLayout>
  );
}
