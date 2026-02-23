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
