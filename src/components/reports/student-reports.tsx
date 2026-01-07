"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { StudentLayout } from "@/components/layouts/student-layout";
import { ReportLostModal } from "@/components/modals/report-lost-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
} from "lucide-react";
import {
  cancelLostReport,
  reactivateLostReport,
} from "@/app/dashboard/reports/actions";
import { StatsSkeleton } from "@/components/skeletons/stats-skeleton";
import { ReportListSkeleton } from "@/components/skeletons/report-card-skeleton";
import type { LostItemReport } from "@/lib/types";

interface StudentReportsProps {
  studentId: number;
}

interface ReportWithMatches extends LostItemReport {
  matchCount: number;
}

export function StudentReports({ studentId }: StudentReportsProps) {
  const [activeReports, setActiveReports] = useState<ReportWithMatches[]>([]);
  const [closedReports, setClosedReports] = useState<ReportWithMatches[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    reportId: number | null;
  }>({ open: false, reportId: null });
  const [reactivateDialog, setReactivateDialog] = useState<{
    open: boolean;
    reportId: number | null;
  }>({ open: false, reportId: null });

  useEffect(() => {
    fetchReports();
  }, [studentId]);

  const fetchReports = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Fetch all reports for the student
      const { data: reports, error: reportsError } = await supabase
        .from("lostitemreport")
        .select("*")
        .eq("student_id", studentId)
        .order("reported_at", { ascending: false });

      if (reportsError) throw reportsError;

      if (reports && reports.length > 0) {
        // Get match counts for all reports
        const reportIds = reports.map((r) => r.report_id);
        const { data: matchCounts } = await supabase
          .from("match")
          .select("report_id")
          .in("report_id", reportIds);

        // Count matches per report
        const matchCountMap = new Map<number, number>();
        matchCounts?.forEach((match) => {
          matchCountMap.set(
            match.report_id,
            (matchCountMap.get(match.report_id) || 0) + 1
          );
        });

        // Separate active and closed reports with match counts
        const reportsWithMatches = reports.map((report) => ({
          ...report,
          matchCount: matchCountMap.get(report.report_id) || 0,
        }));

        setActiveReports(
          reportsWithMatches.filter((r) => r.status === "active")
        );
        setClosedReports(
          reportsWithMatches.filter((r) => r.status === "closed")
        );
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReport = async () => {
    if (!cancelDialog.reportId) return;

    const result = await cancelLostReport(cancelDialog.reportId);

    if (result.success) {
      toast.success("Report cancelled successfully");
      fetchReports();
    } else {
      toast.error(result.error || "Failed to cancel report");
    }

    setCancelDialog({ open: false, reportId: null });
  };

  const handleReactivateReport = async () => {
    if (!reactivateDialog.reportId) return;

    const result = await reactivateLostReport(reactivateDialog.reportId);

    if (result.success) {
      toast.success("Report reactivated successfully");
      fetchReports();
    } else {
      toast.error(result.error || "Failed to reactivate report");
    }

    setReactivateDialog({ open: false, reportId: null });
  };

  if (loading) {
    return (
      <StudentLayout 
        onReportClick={() => setIsModalOpen(true)}
        currentPath="reports"
      >
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
              <h1 className="text-2xl font-semibold text-gray-900">My Reports</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage your lost item reports
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <StatsSkeleton />
          <div className="mt-6">
            <ReportListSkeleton />
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout 
      onReportClick={() => setIsModalOpen(true)}
      currentPath="reports"
    >
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
            <h1 className="text-2xl font-semibold text-gray-900">My Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track and manage your lost item reports
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{activeReports.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active Reports</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{closedReports.length}</p>
            <p className="text-xs text-gray-500 mt-1">Closed Reports</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">
              {activeReports.reduce((sum, r) => sum + r.matchCount, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Matches</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">
              {activeReports.length + closedReports.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">All Reports</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-gray-100 rounded-lg p-1">
            <TabsTrigger 
              value="active"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-fetch-red data-[state=active]:shadow-sm"
            >
              Active ({activeReports.length})
            </TabsTrigger>
            <TabsTrigger 
              value="closed"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              Closed ({closedReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeReports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active reports</h3>
                <p className="text-sm text-gray-500">
                  Report a lost item to start finding matches!
                </p>
              </div>
            ) : (
              activeReports.map((report) => (
                <ReportCard
                  key={report.report_id}
                  report={report}
                  onCancel={() =>
                    setCancelDialog({
                      open: true,
                      reportId: report.report_id,
                    })
                  }
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4 mt-6">
            {closedReports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No closed reports</h3>
                <p className="text-sm text-gray-500">
                  Closed reports will appear here
                </p>
              </div>
            ) : (
              closedReports.map((report) => (
                <ReportCard
                  key={report.report_id}
                  report={report}
                  onReactivate={() =>
                    setReactivateDialog({
                      open: true,
                      reportId: report.report_id,
                    })
                  }
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={cancelDialog.open}
        onOpenChange={(open) =>
          setCancelDialog({ open, reportId: cancelDialog.reportId })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the report as closed and stop searching for
              matches. You can reactivate it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Active</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelReport}
              className="bg-fetch-red hover:bg-fetch-red/90"
            >
              Cancel Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog
        open={reactivateDialog.open}
        onOpenChange={(open) =>
          setReactivateDialog({ open, reportId: reactivateDialog.reportId })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the report as active and resume searching for
              matches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivateReport}
              className="bg-fetch-red hover:bg-fetch-red/90"
            >
              Reactivate Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Lost Modal */}
      {isModalOpen && (
        <ReportLostModal
          studentId={studentId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </StudentLayout>
  );
}

interface ReportCardProps {
  report: ReportWithMatches;
  onCancel?: () => void;
  onReactivate?: () => void;
}

function ReportCard({ report, onCancel, onReactivate }: ReportCardProps) {
  const reportedDate = new Date(report.reported_at).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const isActive = report.status === "active";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="shrink-0">
            {report.image_url ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={report.image_url}
                  alt={report.item_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {report.item_name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {report.category}
                  </Badge>
                  {isActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      Closed
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {report.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {report.description}
              </p>
            )}

            <div className="space-y-1 text-sm text-gray-600 mb-3">
              {report.last_seen_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Last seen: {report.last_seen_location}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Reported: {reportedDate}</span>
              </div>

              {report.matchCount > 0 && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-fetch-red" />
                  <span className="text-fetch-red font-medium">
                    {report.matchCount} potential{" "}
                    {report.matchCount === 1 ? "match" : "matches"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isActive ? (
                <>
                  {report.matchCount > 0 && (
                    <Link href="/dashboard/matches">
                      <Button
                        size="sm"
                        className="bg-fetch-red hover:bg-fetch-red/90"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Matches
                      </Button>
                    </Link>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    className="text-gray-600"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReactivate}
                  className="text-fetch-red border-fetch-red hover:bg-fetch-red/10"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
