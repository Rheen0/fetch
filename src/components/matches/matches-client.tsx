"use client";

import { useState } from "react";
import { StudentLayout } from "@/components/layouts/student-layout";
import { PageHeader } from "@/components/layouts/page-header";
import { ReportLostModal } from "@/components/modals/report-lost-modal";
import { MatchList } from "@/components/home/student/match-list";
import { EmptyState } from "@/components/home/student/empty-state";
import type { LostItemWithMatches } from "@/lib/types";

interface MatchesClientProps {
  studentId: number;
  matchResults: LostItemWithMatches[];
  hasNoReports: boolean;
  hasNoMatches: boolean;
}

export function MatchesClient({
  studentId,
  matchResults,
  hasNoReports,
  hasNoMatches,
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

  return (
    <StudentLayout 
      onReportClick={() => setIsModalOpen(true)}
      currentPath="dashboard"
    >
      <PageHeader
        title="Your Matches"
        subtitle="We found potential matches for your lost items"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
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
