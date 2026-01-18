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
  const details: string[] = [];

  // 1. Category Match (40 points) - Must match category
  if (lostItem.category === foundItem.category) {
    score += 40;
    details.push(`Category match: +40`);
  } else {
    details.push(`Category mismatch: 0`);
    // Different categories = no match
    return 0;
  }

  // 2. Item Name Similarity (35 points)
  const nameSimilarity = getStringSimilarity(
    lostItem.item_name,
    foundItem.item_name
  );
  const namePoints = nameSimilarity * 35;
  score += namePoints;
  details.push(`Name similarity: ${(nameSimilarity * 100).toFixed(0)}% = +${namePoints.toFixed(1)}`);

  // 3. Description Similarity (15 points)
  if (lostItem.description && foundItem.description) {
    const descSimilarity = getStringSimilarity(
      lostItem.description,
      foundItem.description
    );
    const descPoints = descSimilarity * 15;
    score += descPoints;
    details.push(`Description similarity: ${(descSimilarity * 100).toFixed(0)}% = +${descPoints.toFixed(1)}`);
  } else if (lostItem.description || foundItem.description) {
    // One has description, other doesn't - small penalty
    details.push(`Missing description: 0`);
  }

  // 4. Time Proximity (10 points)
  const timeDiff = Math.abs(
    new Date(foundItem.found_at).getTime() -
      new Date(lostItem.reported_at).getTime()
  );
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  if (daysDiff <= 7) {
    const timePoints = ((7 - daysDiff) / 7) * 10;
    score += timePoints;
    details.push(`Time proximity (${daysDiff.toFixed(1)} days): +${timePoints.toFixed(1)}`);
  } else {
    details.push(`Time difference too large (${daysDiff.toFixed(1)} days): 0`);
  }

  const finalScore = Math.round(Math.min(score, 100));

  return finalScore;
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
  minScore: number = 40
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
  const { getPendingFoundItems, upsertMatch, createMatchNotification } = await import("./fetchers");

  // Get all pending found items
  const foundItems = await getPendingFoundItems();

  if (foundItems.length === 0) {
    return;
  }

  // Find matches
  const matches = findTopMatches(lostItem, foundItems, 10, 40);

  // Save matches to database and create notifications for good matches
  for (const { foundItem, score } of matches) {
    const matchId = await upsertMatch(reportId, foundItem.found_id, score);
    
    // Create notification for matches with score >= 50
    if (matchId && score >= 50) {
      await createMatchNotification(
        lostItem.student_id,
        matchId,
        `We found a ${score}% match for your ${lostItem.item_name}!`
      );
    }
  }
}
