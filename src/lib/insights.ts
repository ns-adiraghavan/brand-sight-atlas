/**
 * INSIGHT GENERATION UTILITIES
 * 
 * All AI-generated insights must:
 * - Acknowledge the selected time range
 * - Avoid absolute claims
 * - Use probabilistic language when data coverage is partial
 * - Reference trends rather than single-day values
 */

import { DataStatus } from "@/components/dashboard/DataStatusIndicator";

export type InsightType = "alert" | "warning" | "info";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
}

/**
 * Probabilistic language modifiers based on data coverage
 */
const PROBABILISTIC_MODIFIERS = {
  complete: {
    prefix: "",
    suffix: "",
    verbs: ["shows", "indicates", "reveals"],
  },
  partial: {
    prefix: "Available data suggests ",
    suffix: " (based on partial coverage)",
    verbs: ["suggests", "appears to show", "may indicate"],
  },
  limited: {
    prefix: "Limited data suggests ",
    suffix: " (coverage gaps present)",
    verbs: ["may suggest", "could indicate", "appears to"],
  },
};

/**
 * Generate time-aware phrasing for insights
 */
export function getTimePhrasing(preset: string): {
  phrase: string;
  comparative: string;
  trendPhrase: string;
} {
  const phrasings: Record<string, { phrase: string; comparative: string; trendPhrase: string }> = {
    "7d": {
      phrase: "over the past 7 days",
      comparative: "week-over-week",
      trendPhrase: "this week's trend",
    },
    "30d": {
      phrase: "over the past 30 days",
      comparative: "month-over-month",
      trendPhrase: "the monthly trend",
    },
    "90d": {
      phrase: "over the past quarter",
      comparative: "quarter-over-quarter",
      trendPhrase: "the quarterly trend",
    },
    "ytd": {
      phrase: "since the start of the year",
      comparative: "year-over-year",
      trendPhrase: "the year-to-date trend",
    },
  };

  return phrasings[preset] || phrasings["30d"];
}

/**
 * Apply probabilistic modifier to an insight description
 */
export function applyProbabilisticLanguage(
  description: string,
  coverage: DataStatus["coverage"]
): string {
  const modifiers = PROBABILISTIC_MODIFIERS[coverage];
  
  if (coverage === "complete") {
    return description;
  }
  
  // Add prefix if it doesn't already start with modifier language
  if (!description.toLowerCase().startsWith("available") && 
      !description.toLowerCase().startsWith("limited")) {
    return modifiers.prefix + description.charAt(0).toLowerCase() + description.slice(1);
  }
  
  return description;
}

/**
 * Generate OLA insights with time-awareness and probabilistic language
 */
export function generateOLAInsights(
  metrics: {
    skusAtRisk: number;
    overallAvailability: number;
    mustHaveAvailability: number;
    topPacksAvailability: number;
    weeklyChange: number;
  },
  timePhrase: string,
  coverage: DataStatus["coverage"]
): Insight[] {
  const insights: Insight[] = [];
  const modifier = PROBABILISTIC_MODIFIERS[coverage];
  const verb = modifier.verbs[Math.floor(Math.random() * modifier.verbs.length)];

  // Critical alerts based on thresholds (avoid hard-coded single values)
  if (metrics.skusAtRisk > 5) {
    insights.push({
      id: "ola-1",
      type: "alert",
      title: "Elevated stockout risk detected",
      description: applyProbabilisticLanguage(
        `${metrics.skusAtRisk} SKUs ${verb} sustained low availability ${timePhrase}. Trend analysis recommended before escalation.`,
        coverage
      ),
    });
  }

  // Trend-based warning (not single-day)
  if (metrics.weeklyChange < -2) {
    insights.push({
      id: "ola-2",
      type: "warning",
      title: "Declining availability trend",
      description: applyProbabilisticLanguage(
        `Overall availability ${verb} a downward pattern ${timePhrase}. Consider reviewing replenishment cycles.`,
        coverage
      ),
    });
  } else if (metrics.mustHaveAvailability < 90) {
    insights.push({
      id: "ola-2",
      type: "warning",
      title: "Must-Have SKU coverage below target",
      description: applyProbabilisticLanguage(
        `Must-Have availability ${verb} gaps ${timePhrase}. ${100 - metrics.mustHaveAvailability}% shortfall from 90% target.`,
        coverage
      ),
    });
  }

  // Positive trend detection
  if (metrics.weeklyChange > 2) {
    insights.push({
      id: "ola-3",
      type: "info",
      title: "Positive availability momentum",
      description: applyProbabilisticLanguage(
        `Trend ${verb} improving availability ${timePhrase}. Continue monitoring for sustainability.`,
        coverage
      ),
    });
  } else if (metrics.topPacksAvailability >= 90) {
    insights.push({
      id: "ola-3",
      type: "info",
      title: "Strong Top Pack performance",
      description: applyProbabilisticLanguage(
        `Top Pack availability ${verb} stable above target ${timePhrase}.`,
        coverage
      ),
    });
  }

  return insights;
}

/**
 * Generate SoS insights with time-awareness and probabilistic language
 */
export function generateSoSInsights(
  metrics: {
    avgRank: number;
    page1Presence: number;
    sosPresence: number;
    rankChange: number;
    keywordsBelowTop20: number;
  },
  timePhrase: string,
  coverage: DataStatus["coverage"]
): Insight[] {
  const insights: Insight[] = [];
  const modifier = PROBABILISTIC_MODIFIERS[coverage];
  const verb = modifier.verbs[Math.floor(Math.random() * modifier.verbs.length)];

  // Trend-based alerts (avoid single-day claims)
  if (metrics.keywordsBelowTop20 > 5) {
    insights.push({
      id: "sos-1",
      type: "alert",
      title: "Multiple keywords losing visibility",
      description: applyProbabilisticLanguage(
        `${metrics.keywordsBelowTop20} keywords ${verb} positions below top 20 ${timePhrase}. Review optimization strategy.`,
        coverage
      ),
    });
  }

  // Rank trend warning
  if (metrics.rankChange > 2) {
    insights.push({
      id: "sos-2",
      type: "warning",
      title: "Average rank declining",
      description: applyProbabilisticLanguage(
        `Average position ${verb} weakening trend ${timePhrase}. Consider sponsored bid adjustments.`,
        coverage
      ),
    });
  } else if (metrics.page1Presence < 50) {
    insights.push({
      id: "sos-2",
      type: "warning",
      title: "Page 1 presence below threshold",
      description: applyProbabilisticLanguage(
        `Fewer than half of tracked keywords ${verb} page 1 presence ${timePhrase}.`,
        coverage
      ),
    });
  }

  // Positive signals
  if (metrics.rankChange < -1) {
    insights.push({
      id: "sos-3",
      type: "info",
      title: "Rank improvement observed",
      description: applyProbabilisticLanguage(
        `Average rank ${verb} positive movement ${timePhrase}. Trend appears sustainable.`,
        coverage
      ),
    });
  } else if (metrics.sosPresence >= 80) {
    insights.push({
      id: "sos-3",
      type: "info",
      title: "Strong search presence",
      description: applyProbabilisticLanguage(
        `High visibility maintained across tracked keywords ${timePhrase}.`,
        coverage
      ),
    });
  }

  return insights;
}

/**
 * Generate decision summaries with probabilistic language
 */
export function generateDecisionSummary(
  items: string[],
  coverage: DataStatus["coverage"]
): string[] {
  if (coverage === "complete") {
    return items;
  }

  // Add qualifier for partial/limited coverage
  const qualifier = coverage === "partial" 
    ? "Based on available data: " 
    : "With limited data visibility: ";

  return items.map((item, index) => 
    index === 0 ? qualifier + item.charAt(0).toLowerCase() + item.slice(1) : item
  );
}
