"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ReportLostModal } from "@/components/modals/report-lost-modal";
import { AllMatchesModal } from "@/components/modals/all-matches-modal";
import { StudentLayout } from "@/components/layouts/student-layout";
import Link from "next/link";
import { Search, Eye, User, Bell } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { StatsCard } from "./stats-card";
import { StatsSkeleton } from "@/components/skeletons/stats-skeleton";
import { MatchCardListSkeleton } from "@/components/skeletons/match-card-skeleton";
import type {
  LostItemWithMatches,
  StudentStats,
  MatchedFoundItem,
} from "@/lib/types";

interface HomeProps {
  studentId: number;
  firstName?: string;
  email: string;
  avatarUrl?: string | null;
}

export function StudentHome({
  studentId,
  firstName,
  email,
  avatarUrl,
}: HomeProps) {
  const [matchedItems, setMatchedItems] = useState<LostItemWithMatches[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    activeReports: 0,
    pendingClaims: 0,
    itemsClaimed: 0,
    totalMatches: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    lostItemName: string;
    matches: MatchedFoundItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      try {
        // Fetch student's active reports
        const { data: reports, error: reportsError } = await supabase
          .from("lostitemreport")
          .select("*")
          .eq("student_id", studentId)
          .eq("status", "active")
          .order("reported_at", { ascending: false });

        if (reportsError) {
          console.error("Error fetching reports:", reportsError);
          setMatchedItems([]);
        } else if (reports && reports.length > 0) {
          // For each report, fetch its matches
          const matchResults: LostItemWithMatches[] = [];

          for (const report of reports) {
            const { data: matches, error: matchesError } = await supabase
              .from("match")
              .select(
                `
                match_id,
                found_id,
                match_score,
                founditem!inner (
                  found_id,
                  security_id,
                  item_name,
                  image_url,
                  category,
                  found_location,
                  status,
                  found_at
                )
              `
              )
              .eq("report_id", report.report_id)
              .order("match_score", { ascending: false });

            if (matchesError) {
              console.error("Error fetching matches:", matchesError);
              continue;
            }

            if (!matches || matches.length === 0) {
              matchResults.push({ report, matches: [] });
              continue;
            }

            // Get security names
            const securityIds = matches
              .map((m) => {
                const founditem = m.founditem;
                if (!founditem) return undefined;
                const item = Array.isArray(founditem)
                  ? founditem[0]
                  : founditem;
                return item?.security_id;
              })
              .filter((id): id is number => id !== undefined && id !== null);

            const { data: securityData } = await supabase
              .from("securitypersonnel")
              .select("security_id, first_name, last_name")
              .in("security_id", securityIds);

            const securityNames = new Map(
              (securityData || []).map((s) => [
                s.security_id,
                `${s.first_name} ${s.last_name}`,
              ])
            );

            // Map to MatchedFoundItem
            const matchedItems = matches
              .filter((m) => m.founditem)
              .map((m) => {
                const founditem = Array.isArray(m.founditem)
                  ? m.founditem[0]
                  : m.founditem;

                if (!founditem) return null;

                return {
                  found_id: founditem.found_id,
                  security_id: founditem.security_id,
                  item_name: founditem.item_name,
                  image_url: founditem.image_url,
                  category: founditem.category,
                  found_location: founditem.found_location,
                  status: founditem.status,
                  found_at: founditem.found_at,
                  match_score: m.match_score,
                  match_id: m.match_id,
                  security_name:
                    securityNames.get(founditem.security_id) || "Unknown",
                };
              })
              .filter((item): item is MatchedFoundItem => item !== null);

            matchResults.push({ report, matches: matchedItems });
          }

          setMatchedItems(matchResults);
        } else {
          setMatchedItems([]);
        }

        // Fetch stats
        const reportIds =
          (
            await supabase
              .from("lostitemreport")
              .select("report_id")
              .eq("student_id", studentId)
          ).data?.map((r) => r.report_id) || [];

        const [activeReports, pendingClaims, approvedClaims, totalMatches] =
          await Promise.all([
            supabase
              .from("lostitemreport")
              .select("report_id", { count: "exact", head: true })
              .eq("student_id", studentId)
              .eq("status", "active"),

            supabase
              .from("claim")
              .select("claim_id", { count: "exact", head: true })
              .eq("student_id", studentId)
              .eq("status", "pending"),

            supabase
              .from("claim")
              .select("claim_id", { count: "exact", head: true })
              .eq("student_id", studentId)
              .eq("status", "approved"),

            reportIds.length > 0
              ? supabase
                  .from("match")
                  .select("match_id", { count: "exact", head: true })
                  .in("report_id", reportIds)
              : { count: 0 },
          ]);

        setStats({
          activeReports: activeReports.count || 0,
          pendingClaims: pendingClaims.count || 0,
          itemsClaimed: approvedClaims.count || 0,
          totalMatches: totalMatches.count || 0,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Get only the best match for each lost item
  const bestMatches = matchedItems
    .filter((item) => item.matches.length > 0)
    .map((item) => {
      const bestMatch = item.matches.sort(
        (a, b) => b.match_score - a.match_score
      )[0];
      return {
        ...bestMatch,
        lostItemName: item.report.item_name,
        reportId: item.report.report_id,
        totalMatches: item.matches.length,
        allMatches: item.matches,
      };
    });

  const filteredMatches = searchQuery
    ? bestMatches.filter(
        (match) =>
          match.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.lostItemName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bestMatches;

  return (
    <StudentLayout
      onReportClick={() => setIsModalOpen(true)}
      currentPath="dashboard"
    >
      {/* Main Content */}
      <div className="p-4 pb-24">
        {/* Header with Avatar and Notification */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/profile" className="flex items-center gap-2">
            {avatarUrl ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={avatarUrl}
                  alt={firstName || "User"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </Link>

          <button className="relative p-2">
            <Bell className="w-6 h-6 text-gray-700" />
            {stats.pendingClaims > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-fetch-red rounded-full"></span>
            )}
          </button>
        </div>

        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Let's help you fetch your lost item.
          </p>
        </div>

        {/* Stats Card */}
        <div>
          {loading ? (
            <StatsSkeleton />
          ) : (
            <Card className="bg-fetch-red text-white border-0 mb-6 overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      {stats.activeReports}
                    </div>
                    <div className="text-xs opacity-90">Active Reports</div>
                  </div>
                  <div className="text-center border-x border-white/20">
                    <div className="text-3xl font-bold mb-1">
                      {stats.pendingClaims}
                    </div>
                    <div className="text-xs opacity-90">Pending Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      {stats.itemsClaimed}
                    </div>
                    <div className="text-xs opacity-90">Item Claimed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Browse Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Best Matches
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Highest confidence results
              </p>
            </div>
            <Link href="/dashboard/matches">
              <Button
                variant="ghost"
                size="sm"
                className="text-fetch-red hover:text-fetch-red hover:bg-fetch-red/10"
              >
                View All
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search your matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-200 focus:border-fetch-red focus:ring-fetch-red"
            />
          </div>

          {/* Matched Items Display - Grid or Marquee */}
          {loading ? (
            <MatchCardListSkeleton />
          ) : filteredMatches.length > 0 ? (
            <div className="relative">
              {filteredMatches.length < 4 ? (
                // Static grid for 1-3 items
                <div className="flex flex-wrap gap-4 justify-center">
                  {filteredMatches.map((match) => (
                    <div
                      key={`${match.reportId}-${match.found_id}`}
                      className="flex justify-center w-full sm:w-auto"
                    >
                      <BestMatchCard
                        match={match}
                        onViewAll={() =>
                          setSelectedItem({
                            lostItemName: match.lostItemName,
                            matches: match.allMatches,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                // Marquee for 4+ items
                <Marquee pauseOnHover className="[--duration:60s]">
                  {filteredMatches.map((match) => (
                    <BestMatchCard
                      key={`${match.reportId}-${match.found_id}`}
                      match={match}
                      onViewAll={() =>
                        setSelectedItem({
                          lostItemName: match.lostItemName,
                          matches: match.allMatches,
                        })
                      }
                    />
                  ))}
                </Marquee>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery
                ? "No matches found for your search"
                : stats.activeReports > 0
                  ? "No matches yet. We'll notify you when we find similar items!"
                  : "Report a lost item to start finding matches"}
            </div>
          )}
        </div>
      </div>

      {/* Report Lost Modal */}
      {isModalOpen && (
        <ReportLostModal
          studentId={studentId}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* All Matches Modal */}
      {selectedItem && (
        <AllMatchesModal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          lostItemName={selectedItem.lostItemName}
          matches={selectedItem.matches}
        />
      )}
    </StudentLayout>
  );
}

interface BestMatchCardProps {
  match: {
    found_id: number;
    item_name: string;
    image_url: string | null;
    category: string;
    found_location: string | null;
    found_at: string;
    match_score: number;
    security_name: string;
    lostItemName: string;
    totalMatches: number;
  };
  onViewAll: () => void;
}

function BestMatchCard({ match, onViewAll }: BestMatchCardProps) {
  const foundDate = new Date(match.found_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const scoreColor =
    match.match_score >= 70
      ? "bg-green-50 text-green-700 border-green-200"
      : match.match_score >= 50
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-orange-50 text-orange-700 border-orange-200";

  return (
    <Card className="w-[280px] shrink-0 overflow-hidden border-gray-200 hover:border-fetch-red transition-all hover:shadow-md">
      <CardContent className="p-0">
        {match.image_url ? (
          <div className="relative w-full h-[200px] bg-gray-100">
            <Image
              src={match.image_url}
              alt={match.item_name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="bg-white/95 text-gray-900 text-xs font-medium px-3 py-1 rounded-full">
                Best Match
              </span>
              <span
                className={`${scoreColor} text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-sm`}
              >
                {match.match_score}%
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-gray-500 text-xs">No Image</span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="bg-white text-gray-900 text-xs font-medium px-3 py-1 rounded-full">
                Best Match
              </span>
              <span
                className={`${scoreColor} text-xs font-bold px-3 py-1 rounded-full border`}
              >
                {match.match_score}%
              </span>
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                {match.category}
              </span>
            </div>
            <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
              {match.item_name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
              For: <span className="font-medium">{match.lostItemName}</span>
            </p>
          </div>

          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-fetch-red mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="line-clamp-1">{match.found_location}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{foundDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{match.security_name}</span>
            </div>
          </div>

          {match.totalMatches > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAll}
              className="w-full text-sm border-fetch-red text-fetch-red hover:bg-fetch-red hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View All {match.totalMatches} Matches
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
