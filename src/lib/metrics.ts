/**
 * SEMANTIC CONTRACTS
 * 
 * These definitions are locked and should not be reinterpreted.
 */

// ============= ONLINE AVAILABILITY (OLA) =============
// Grain: SKU × Pincode × Day
// Availability truth: TRUE = available, FALSE = unavailable
// Aggregation: Availability % = average of availability values
// Default time aggregation: Weekly
// Missing data: treated as "unknown", NOT FALSE

export interface OLADataPoint {
  sku: string;
  pincode: string;
  date: string; // ISO date
  available: boolean | null; // null = unknown (NOT false)
}

export interface OLAAggregated {
  date: string;
  overallAvailability: number | null;
  topPackAvailability: number | null;
  mustHaveAvailability: number | null;
}

// ============= SHARE OF SEARCH (SoS) =============
// Grain: Keyword × Rank × Day
// Presence definition: Rank ≤ 25
// Page 1 presence: Rank ≤ 10
// Average rank applies only where presence exists
// Default time aggregation: Weekly

export interface SoSDataPoint {
  keyword: string;
  rank: number | null; // null = no presence
  date: string; // ISO date
  resultType: "Organic" | "Sponsored" | "Brand Sponsored";
}

export interface SoSAggregated {
  date: string;
  presencePct: number | null; // % with rank ≤ 25
  page1PresencePct: number | null; // % with rank ≤ 10
  avgSearchRank: number | null; // only where presence exists
}

// ============= FIXED DERIVED METRICS =============
// Only these metrics may be computed or displayed

export const ALLOWED_OLA_METRICS = [
  "overallAvailability",    // Overall Availability %
  "skusAtRisk",             // SKUs at Risk (count)
  "pincodesAffected",       // Pincodes Affected (count)
  "topPackAvailability",    // Top Pack Availability %
] as const;

export const ALLOWED_SOS_METRICS = [
  "sosPresence",            // SoS Presence % (rank ≤ 25)
  "page1Presence",          // Page 1 Presence % (rank ≤ 10)
  "avgSearchRank",          // Average Search Rank (presence only)
] as const;

export type OLAMetricKey = typeof ALLOWED_OLA_METRICS[number];
export type SoSMetricKey = typeof ALLOWED_SOS_METRICS[number];

// ============= CHART LIMITS =============

export const CHART_LIMITS = {
  maxLines: 3,
  maxRows: 10,
  maxBars: 7,
} as const;

// ============= DATA HANDLING UTILITIES =============

/**
 * Calculate availability percentage, excluding unknown (null) values
 * Returns null if no valid data points
 */
export function calculateAvailabilityPct(values: (boolean | null)[]): number | null {
  const validValues = values.filter((v): v is boolean => v !== null);
  if (validValues.length === 0) return null;
  const available = validValues.filter(v => v === true).length;
  return (available / validValues.length) * 100;
}

/**
 * Calculate average, excluding null values
 * Returns null if no valid data points
 */
export function calculateAverage(values: (number | null)[]): number | null {
  const validValues = values.filter((v): v is number => v !== null);
  if (validValues.length === 0) return null;
  return validValues.reduce((a, b) => a + b, 0) / validValues.length;
}

/**
 * Calculate presence percentage (rank ≤ threshold)
 * Null ranks are treated as "not present"
 */
export function calculatePresencePct(ranks: (number | null)[], threshold: number = 25): number | null {
  if (ranks.length === 0) return null;
  const present = ranks.filter((r): r is number => r !== null && r <= threshold).length;
  return (present / ranks.length) * 100;
}

/**
 * Calculate average rank only for items with presence (rank ≤ 25)
 */
export function calculateAvgRankWithPresence(ranks: (number | null)[]): number | null {
  const presentRanks = ranks.filter((r): r is number => r !== null && r <= 25);
  if (presentRanks.length === 0) return null;
  return presentRanks.reduce((a, b) => a + b, 0) / presentRanks.length;
}

/**
 * Filter out dates with incomplete data
 * A date is considered incomplete if more than threshold% of values are null
 */
export function filterCompleteDates<T extends { date: string }>(
  data: T[],
  getNullCount: (item: T) => number,
  getTotalCount: (item: T) => number,
  incompleteThreshold: number = 0.5 // 50% null = incomplete
): T[] {
  return data.filter(item => {
    const nullCount = getNullCount(item);
    const totalCount = getTotalCount(item);
    if (totalCount === 0) return false;
    return (nullCount / totalCount) <= incompleteThreshold;
  });
}

/**
 * Truncate array to limit with optional aggregation
 */
export function truncateToLimit<T>(
  items: T[],
  limit: number,
  aggregateLabel?: string
): { items: T[]; hasMore: boolean; remainingCount: number } {
  if (items.length <= limit) {
    return { items, hasMore: false, remainingCount: 0 };
  }
  return {
    items: items.slice(0, limit),
    hasMore: true,
    remainingCount: items.length - limit,
  };
}

/**
 * Check if data is sufficient for display
 */
export function hasValidData(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && !isNaN(value);
}

/**
 * Format metric value for display, handling nulls
 */
export function formatMetricValue(
  value: number | null,
  type: "percentage" | "rank" | "count",
  decimals: number = 1
): string {
  if (value === null) return "—";
  
  switch (type) {
    case "percentage":
      return `${value.toFixed(decimals)}%`;
    case "rank":
      return `#${value.toFixed(decimals)}`;
    case "count":
      return value.toFixed(0);
    default:
      return value.toFixed(decimals);
  }
}

// ============= PLACEHOLDER MESSAGES =============

export const PLACEHOLDER_MESSAGES = {
  noData: "No data available for the selected period",
  partialData: "Some data points are incomplete",
  insufficientData: "Insufficient data to display this chart",
  loading: "Loading...",
} as const;
