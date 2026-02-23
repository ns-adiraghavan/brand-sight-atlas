/**
 * Client-side GROUP BY platform aggregation.
 *
 * Takes an array of rows (each with a `platform` string column)
 * and returns one aggregated row per platform.
 *
 * @param rows - raw rows from Supabase (already date-filtered)
 * @param numericKeys - columns to aggregate
 * @param mode - "avg" averages values across weeks, "sum" sums them (default: "avg")
 */
export function aggregateByPlatform<T extends Record<string, any>>(
  rows: T[],
  numericKeys: string[],
  mode: "avg" | "sum" = "avg"
): T[] {
  const groups = new Map<string, T[]>();

  for (const row of rows) {
    const p = row.platform as string;
    if (!p) continue;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p)!.push(row);
  }

  const result: T[] = [];

  for (const [platform, groupRows] of groups) {
    const agg: Record<string, any> = { platform };

    for (const key of numericKeys) {
      const values = groupRows
        .map((r) => r[key])
        .filter((v): v is number => v != null);

      if (values.length === 0) {
        agg[key] = null;
      } else if (mode === "sum") {
        agg[key] = values.reduce((s, v) => s + v, 0);
      } else {
        agg[key] = values.reduce((s, v) => s + v, 0) / values.length;
      }
    }

    // Copy non-numeric, non-platform keys from first row as fallback
    for (const key of Object.keys(groupRows[0])) {
      if (!(key in agg)) {
        agg[key] = groupRows[0][key];
      }
    }

    result.push(agg as T);
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  Weighted aggregation helpers for vendor health _mat tables         */
/* ------------------------------------------------------------------ */

interface OlaVendorHealthRaw {
  platform: string;
  week: string;
  available_skus: number | null;
  total_skus: number | null;
  must_have_available_skus: number | null;
  must_have_skus: number | null;
}

export interface OlaHealthAggregated {
  platform: string;
  availability_pct: number | null;
  must_have_availability_pct: number | null;
  skus_tracked: number;
}

/**
 * Weighted aggregation for OLA vendor health.
 * Computes percentages from SUM of counts, not AVG of percentages.
 */
export function aggregateOlaHealth(rows: OlaVendorHealthRaw[]): OlaHealthAggregated[] {
  const groups = new Map<string, OlaVendorHealthRaw[]>();
  for (const r of rows) {
    if (!r.platform) continue;
    if (!groups.has(r.platform)) groups.set(r.platform, []);
    groups.get(r.platform)!.push(r);
  }

  const result: OlaHealthAggregated[] = [];
  for (const [platform, gRows] of groups) {
    const sumAvailable = gRows.reduce((s, r) => s + (r.available_skus ?? 0), 0);
    const sumTotal = gRows.reduce((s, r) => s + (r.total_skus ?? 0), 0);
    const sumMHAvailable = gRows.reduce((s, r) => s + (r.must_have_available_skus ?? 0), 0);
    const sumMHTotal = gRows.reduce((s, r) => s + (r.must_have_skus ?? 0), 0);

    // Use max total_skus as representative "tracked" count
    const maxSkus = Math.max(...gRows.map((r) => r.total_skus ?? 0));

    result.push({
      platform,
      availability_pct: sumTotal > 0 ? sumAvailable / sumTotal : null,
      must_have_availability_pct: sumMHTotal > 0 ? sumMHAvailable / sumMHTotal : null,
      skus_tracked: maxSkus,
    });
  }
  return result;
}

interface SosVendorHealthRaw {
  platform: string;
  week: string;
  top10_keywords: number | null;
  elite_keywords: number | null;
  total_keywords: number | null;
}

export interface SosHealthAggregated {
  platform: string;
  top10_presence_pct: number | null;
  elite_rank_share_pct: number | null;
  keywords_tracked: number;
}

/**
 * Weighted aggregation for SoS vendor health.
 * Computes percentages from SUM of counts, not AVG of percentages.
 */
export function aggregateSosHealth(rows: SosVendorHealthRaw[]): SosHealthAggregated[] {
  const groups = new Map<string, SosVendorHealthRaw[]>();
  for (const r of rows) {
    if (!r.platform) continue;
    if (!groups.has(r.platform)) groups.set(r.platform, []);
    groups.get(r.platform)!.push(r);
  }

  const result: SosHealthAggregated[] = [];
  for (const [platform, gRows] of groups) {
    const sumTop10 = gRows.reduce((s, r) => s + (r.top10_keywords ?? 0), 0);
    const sumElite = gRows.reduce((s, r) => s + (r.elite_keywords ?? 0), 0);
    const sumTotal = gRows.reduce((s, r) => s + (r.total_keywords ?? 0), 0);

    const maxKws = Math.max(...gRows.map((r) => r.total_keywords ?? 0));

    result.push({
      platform,
      top10_presence_pct: sumTotal > 0 ? sumTop10 / sumTotal : null,
      elite_rank_share_pct: sumTotal > 0 ? sumElite / sumTotal : null,
      keywords_tracked: maxKws,
    });
  }
  return result;
}
