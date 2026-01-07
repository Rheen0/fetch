"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ReportLostModal } from "@/components/modals/report-lost-modal";
import { AllMatchesModal } from "@/components/modals/all-matches-modal";
import Link from "next/link";
import { Search, Bell, Home, User, Plus, Eye, FileText } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Dock, DockIcon } from "@/components/ui/dock";
import type {
  LostItemWithMatches,
  StudentStats,
  MatchedFoundItem,
} from "@/lib/types";

interface HomeProps {
  studentId: number;
  firstName?: string;
  email: string;
}

export function StudentHome({ studentId, firstName, email }: HomeProps) {
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-fetch-red flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-white"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </div>
          <Bell className="w-6 h-6 text-fetch-red" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName || "Student"}!
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Let&apos;s help you fetch your lost item.
        </p>
      </div>

      {/* Stats Card */}
      <div className="p-4">
        <div className="bg-fetch-red rounded-2xl p-6 text-white">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.activeReports}</p>
              <p className="text-xs mt-1 opacity-90">Active</p>
            </div>
            <div className="text-center border-l border-white/30">
              <p className="text-2xl font-bold">{stats.totalMatches}</p>
              <p className="text-xs mt-1 opacity-90">Matches</p>
            </div>
            <div className="text-center border-l border-white/30">
              <p className="text-2xl font-bold">{stats.pendingClaims}</p>
              <p className="text-xs mt-1 opacity-90">Pending</p>
            </div>
            <div className="text-center border-l border-white/30">
              <p className="text-2xl font-bold">{stats.itemsClaimed}</p>
              <p className="text-xs mt-1 opacity-90">Claimed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Section */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your Best Matches</h2>
          <Link
            href="/dashboard/matches"
            className="text-sm text-gray-600 hover:text-fetch-red"
          >
            See all
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-lg border-gray-200"
          />
        </div>

        {/* Matched Items Display - Grid or Marquee */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading matches...
          </div>
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

      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center">
        <Dock
          direction="middle"
          iconSize={48}
          iconMagnification={64}
          iconDistance={120}
        >
          <DockIcon>
            <Link
              href="/dashboard"
              className="flex items-center justify-center text-fetch-red"
            >
              <Home className="w-6 h-6" />
            </Link>
          </DockIcon>

          <DockIcon className="bg-fetch-red hover:bg-fetch-red/90">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center text-white"
            >
              <Plus className="w-7 h-7" />
            </button>
          </DockIcon>

          <DockIcon>
            <Link
              href="/dashboard/reports"
              className="flex items-center justify-center text-gray-600 hover:text-fetch-red transition-colors"
            >
              <FileText className="w-6 h-6" />
            </Link>
          </DockIcon>
        </Dock>
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
    </div>
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
      ? "bg-green-100 text-green-700"
      : match.match_score >= 50
      ? "bg-yellow-100 text-yellow-700"
      : "bg-orange-100 text-orange-700";

  return (
    <Card className="w-[240px] shrink-0 overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {match.image_url ? (
          <div className="relative w-full h-[180px] bg-gray-100">
            <Image
              src={match.image_url}
              alt={match.item_name}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 left-2 bg-fetch-red text-white text-xs font-bold px-2 py-1 rounded-full">
              BEST MATCH
            </div>
          </div>
        ) : (
          <div className="w-full h-[180px] bg-gray-200 flex items-center justify-center relative">
            <span className="text-gray-400 text-sm">No Image</span>
            <div className="absolute top-2 left-2 bg-fetch-red text-white text-xs font-bold px-2 py-1 rounded-full">
              BEST MATCH
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 capitalize">
              {match.category}
            </span>
            <div
              className={`${scoreColor} text-xs font-semibold px-2 py-1 rounded`}
            >
              {match.match_score}% match
            </div>
          </div>

          <h3 className="font-semibold text-sm text-gray-900 mb-1">
            {match.item_name}
          </h3>

          <p className="text-xs text-gray-500 mb-2">
            Match for: {match.lostItemName}
          </p>

          <p className="text-xs text-gray-500 mb-1">
            📍 {match.found_location}
          </p>

          <p className="text-xs text-gray-500 mb-2">Found: {foundDate}</p>

          <p className="text-xs text-gray-500 mb-3">
            By: {match.security_name}
          </p>

          {match.totalMatches > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAll}
              className="w-full text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View All {match.totalMatches} Matches
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
