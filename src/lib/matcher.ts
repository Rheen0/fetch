import type { LostItemReport, FoundItem } from "./types";

/**
 * Calculate match score between a lost item and found item
 * Returns 0-100 score
 */
export function calculateMatchScore(
  lostItem: LostItemReport,
  foundItem: FoundItem
): number {
  let score = 0;

  // 1. Category Match (50 points) - Increased weight since no found item description
  if (lostItem.category === foundItem.category) {
    score += 50;
  }

  // 2. Item Name Similarity (40 points) - Increased weight
  const nameSimilarity = getStringSimilarity(
    lostItem.item_name,
    foundItem.item_name
  );
  score += nameSimilarity * 40;

  // 3. Time Proximity (10 points)
  const timeDiff = Math.abs(
    new Date(foundItem.found_at).getTime() -
      new Date(lostItem.reported_at).getTime()
  );
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  if (daysDiff <= 7) {
    score += ((7 - daysDiff) / 7) * 10;
  }

  return Math.round(Math.min(score, 100));
}

/**
 * String similarity using Levenshtein distance
 */
function getStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  return Math.max(0, 1 - distance / maxLength);
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Find top N matches for a lost item
 */
export function findTopMatches(
  lostItem: LostItemReport,
  foundItems: FoundItem[],
  topN: number = 10,
  minScore: number = 30
): Array<{ foundItem: FoundItem; score: number }> {
  const matches = foundItems
    .map((foundItem) => ({
      foundItem,
      score: calculateMatchScore(lostItem, foundItem),
    }))
    .filter((match) => match.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return matches;
}

/**
 * Process matches for a newly created lost item report
 * This runs on the server only
 */
export async function processNewLostItemMatches(
  reportId: number,
  lostItem: LostItemReport
): Promise<void> {
  // Dynamic import to avoid bundling server code in client
  const { getPendingFoundItems, upsertMatch } = await import("./fetchers");

  // Get all pending found items
  const foundItems = await getPendingFoundItems();

  if (foundItems.length === 0) return;

  // Find matches
  const matches = findTopMatches(lostItem, foundItems, 10, 30);

  // Save matches to database
  for (const { foundItem, score } of matches) {
    await upsertMatch(reportId, foundItem.found_id, score);
  }
}
