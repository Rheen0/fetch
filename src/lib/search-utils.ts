import type { SearchFilters } from "@/components/search/search-filters";
import type { LostItemReport, FoundItem } from "@/lib/types";

/**
 * Filter lost item reports based on search criteria
 */
export function filterLostItems(
  items: LostItemReport[],
  filters: SearchFilters
): LostItemReport[] {
  return items.filter((item) => {
    // Search query - check item name and description
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = item.item_name.toLowerCase().includes(query);
      const matchesDesc = item.description?.toLowerCase().includes(query);
      if (!matchesName && !matchesDesc) return false;
    }

    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    // Location filter
    if (filters.location) {
      if (!item.last_seen_location?.includes(filters.location)) {
        return false;
      }
    }

    // Status filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const itemDate = new Date(item.reported_at);
      const fromDate = new Date(filters.dateFrom);
      if (itemDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const itemDate = new Date(item.reported_at);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59); // Include entire day
      if (itemDate > toDate) return false;
    }

    return true;
  });
}

/**
 * Filter found items based on search criteria
 */
export function filterFoundItems(
  items: FoundItem[],
  filters: SearchFilters
): FoundItem[] {
  return items.filter((item) => {
    // Search query - check item name
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = item.item_name.toLowerCase().includes(query);
      if (!matchesName) return false;
    }

    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    // Location filter
    if (filters.location) {
      if (!item.found_location?.includes(filters.location)) {
        return false;
      }
    }

    // Status filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const itemDate = new Date(item.found_at);
      const fromDate = new Date(filters.dateFrom);
      if (itemDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const itemDate = new Date(item.found_at);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59); // Include entire day
      if (itemDate > toDate) return false;
    }

    return true;
  });
}

/**
 * Sort items by relevance score (for search results)
 */
export function sortByRelevance<T extends { item_name: string }>(
  items: T[],
  searchQuery: string
): T[] {
  if (!searchQuery) return items;

  const query = searchQuery.toLowerCase();

  return [...items].sort((a, b) => {
    const aName = a.item_name.toLowerCase();
    const bName = b.item_name.toLowerCase();

    // Exact match gets highest priority
    const aExact = aName === query ? 3 : 0;
    const bExact = bName === query ? 3 : 0;

    // Starts with query gets second priority
    const aStarts = aName.startsWith(query) ? 2 : 0;
    const bStarts = bName.startsWith(query) ? 2 : 0;

    // Contains query gets lowest priority
    const aContains = aName.includes(query) ? 1 : 0;
    const bContains = bName.includes(query) ? 1 : 0;

    const aScore = aExact + aStarts + aContains;
    const bScore = bExact + bStarts + bContains;

    return bScore - aScore;
  });
}
