"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fetch-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
              <p className="text-sm text-gray-600">
                View and manage your lost item reports
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-fetch-red/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-fetch-red">
                  {activeReports.length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Active</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {activeReports.reduce((sum, r) => sum + r.matchCount, 0)}
                </div>
                <div className="text-xs text-gray-600 mt-1">Matches</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {closedReports.length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Closed</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">
              Active Reports ({activeReports.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed Reports ({closedReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeReports.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don&apos;t have any active reports. Report a lost item to
                  get started!
                </AlertDescription>
              </Alert>
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

          <TabsContent value="closed" className="space-y-4">
            {closedReports.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don&apos;t have any closed reports.
                </AlertDescription>
              </Alert>
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
    </div>
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
          <div className="flex-shrink-0">
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
