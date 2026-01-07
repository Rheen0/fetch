import { createClient } from "@/utils/supabase/server";
import type {
  LostItemReport,
  FoundItem,
  MatchedFoundItem,
  StudentStats,
  LostItemWithMatches,
} from "./types";

/**
 * Fetch active lost item reports for a student
 */
export async function getStudentLostReports(
  studentId: number
): Promise<LostItemReport[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lostitemreport")
    .select("*")
    .eq("student_id", studentId)
    .eq("status", "active")
    .order("reported_at", { ascending: false });

  if (error) {
    console.error("Error fetching lost reports:", error);
    return [];
  }

  return data as LostItemReport[];
}

/**
 * Fetch all pending found items
 */
export async function getPendingFoundItems(): Promise<FoundItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("founditem")
    .select("*")
    .eq("status", "pending")
    .order("found_at", { ascending: false });

  if (error) {
    console.error("Error fetching found items:", error);
    return [];
  }

  return data as FoundItem[];
}

/**
 * Fetch existing matches for a report
 */
export async function getExistingMatches(
  reportId: number
): Promise<Map<number, { matchId: number; score: number }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("match")
    .select("match_id, found_id, match_score")
    .eq("report_id", reportId);

  if (error) {
    console.error("Error fetching matches:", error);
    return new Map();
  }

  return new Map(
    data.map((m) => [m.found_id, { matchId: m.match_id, score: m.match_score }])
  );
}

/**
 * Get security personnel names for found items
 */
export async function getSecurityNames(
  securityIds: number[]
): Promise<Map<number, string>> {
  if (securityIds.length === 0) return new Map();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("securitypersonnel")
    .select("security_id, first_name, last_name")
    .in("security_id", securityIds);

  if (error) {
    console.error("Error fetching security names:", error);
    return new Map();
  }

  return new Map(
    data.map((s) => [s.security_id, `${s.first_name} ${s.last_name}`])
  );
}

/**
 * Save or update a match
 */
export async function upsertMatch(
  reportId: number,
  foundId: number,
  matchScore: number
): Promise<number | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("match")
    .upsert(
      {
        report_id: reportId,
        found_id: foundId,
        match_score: matchScore,
        notified: false,
        matched_at: new Date().toISOString(),
      },
      {
        onConflict: "report_id,found_id",
      }
    )
    .select("match_id")
    .single();

  if (error) {
    console.error("Error upserting match:", error);
    return null;
  }

  return data?.match_id || null;
}

/**
 * Get student's matches with found items
 */
export async function getStudentMatches(
  studentId: number
): Promise<LostItemWithMatches[]> {
  const supabase = await createClient();

  // Get student's active reports
  const { data: reports, error: reportsError } = await supabase
    .from("lostitemreport")
    .select("*")
    .eq("student_id", studentId)
    .eq("status", "active")
    .order("reported_at", { ascending: false });

  if (reportsError || !reports) {
    console.error("Error fetching reports:", reportsError);
    return [];
  }

  const results: LostItemWithMatches[] = [];

  // For each report, get its matches
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
      results.push({ report, matches: [] });
      continue;
    }

    // Get security names
    const securityIds = matches
      .map((m) => {
        const founditem = m.founditem;
        if (!founditem) return undefined;
        // Handle both array and object responses
        const item = Array.isArray(founditem) ? founditem[0] : founditem;
        return item?.security_id;
      })
      .filter((id): id is number => id !== undefined && id !== null);

    const securityNames = await getSecurityNames(securityIds);

    // Map to MatchedFoundItem
    const matchedItems: MatchedFoundItem[] = matches
      .filter((m) => m.founditem)
      .map((m) => {
        // Handle both array and object responses from Supabase
        const founditem = Array.isArray(m.founditem)
          ? m.founditem[0]
          : m.founditem;

        if (!founditem) {
          return null;
        }

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
          security_name: securityNames.get(founditem.security_id) || "Unknown",
        };
      })
      .filter((item): item is MatchedFoundItem => item !== null);

    results.push({ report, matches: matchedItems });
  }

  return results;
}

/**
 * Get student statistics
 */
export async function getStudentStats(
  studentId: number
): Promise<StudentStats> {
  const supabase = await createClient();

  // Get student's report IDs first
  const { data: reportIds } = await supabase
    .from("lostitemreport")
    .select("report_id")
    .eq("student_id", studentId);

  const reportIdList = reportIds?.map((r) => r.report_id) || [];

  const [
    activeReportsResult,
    pendingClaimsResult,
    approvedClaimsResult,
    matchesResult,
  ] = await Promise.all([
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

    reportIdList.length > 0
      ? supabase
          .from("match")
          .select("match_id", { count: "exact", head: true })
          .in("report_id", reportIdList)
      : { count: 0 },
  ]);

  return {
    activeReports: activeReportsResult.count || 0,
    pendingClaims: pendingClaimsResult.count || 0,
    itemsClaimed: approvedClaimsResult.count || 0,
    totalMatches: matchesResult.count || 0,
  };
}
