import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDateRange } from "@/contexts/DateRangeContext";
import { SectionHeader } from "./SectionHeader";
import { MetricTooltip } from "./MetricTooltip";
import { ArrowRight, Database, MapPin, Calendar, BarChart3 } from "lucide-react";
import { aggregateByPlatform } from "@/lib/aggregation";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface VendorGap {
  metric: string;
  tooltip: string;
  platforms: Record<string, number>;
  gap: number;
  gapLabel: string;
  status: "success" | "warning" | "danger";
}

interface CategoryRow {
  category: string;
  platforms: Record<string, number | null>;
}

interface CoverageRow {
  label: string;
  icon: React.ReactNode;
  platforms: Record<string, string>;
}

interface ExecutionDiagnosticsProps {
  variant: "ola" | "sos";
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function gapStatus(gapPP: number, thresholdPP: number): "success" | "warning" | "danger" {
  if (gapPP <= thresholdPP * 0.5) return "success";
  if (gapPP <= thresholdPP) return "warning";
  return "danger";
}

const STATUS_STYLES = {
  success: "text-status-success bg-status-success/10",
  warning: "text-status-warning bg-status-warning/10",
  danger: "text-status-danger bg-status-danger/10",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ExecutionDiagnostics({ variant }: ExecutionDiagnosticsProps) {
  const [gaps, setGaps] = useState<VendorGap[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [coverage, setCoverage] = useState<CoverageRow[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { dateRange } = useDateRange();

  useEffect(() => {
    if (variant === "ola") {
      loadOla();
    } else {
      loadSos();
    }
  }, [variant, dateRange.from.getTime(), dateRange.to.getTime()]);

  /* ---- OLA loader ---- */
  async function loadOla() {
    const fromISO = dateRange.from.toISOString();
    const toISO = dateRange.to.toISOString();

    const [vendorRes, catRes, pinRes, weekRes] = await Promise.all([
      supabase.from("ola_vendor_health_mat").select("*")
        .gte("week", fromISO)
        .lte("week", toISO),
      supabase.from("ola_category_health_mat").select("business_group_clean, availability_pct, platform"),
      supabase.from("ola_pincode_volatility_mat").select("platform, location, avg_availability, volatility_index, week")
        .gte("week", fromISO)
        .lte("week", toISO),
      supabase.from("ola_weekly_trend_mat").select("platform, week")
        .gte("week", fromISO)
        .lte("week", toISO),
    ]);

    // Aggregate vendor health by platform
    const vendorsRaw = (vendorRes.data ?? []) as any[];
    const vendors = aggregateByPlatform(
      vendorsRaw,
      ["availability_pct", "must_have_availability_pct", "sku_reliability_pct", "skus_tracked"]
    );
    const plats = vendors.map((r: any) => r.platform as string);
    setPlatforms(plats);

    // Vendor gaps
    if (plats.length === 2) {
      const [a, b] = vendors;
      const gapMetrics: VendorGap[] = [];

      const addGap = (label: string, tooltip: string, key: string, thresholdPP: number) => {
        const va = (a[key] ?? 0) as number;
        const vb = (b[key] ?? 0) as number;
        const gapVal = Math.abs(va - vb);
        const gapPP = gapVal * 100;
        gapMetrics.push({
          metric: label,
          tooltip,
          platforms: { [a.platform]: va, [b.platform]: vb },
          gap: gapVal,
          gapLabel: `${gapPP.toFixed(1)}pp`,
          status: gapStatus(gapPP, thresholdPP),
        });
      };

      addGap("Availability", "Overall availability % gap between platforms.", "availability_pct", 5);
      addGap("Must-Have Avail", "Gap in must-have SKU availability between platforms.", "must_have_availability_pct", 5);
      addGap("SKU Consistency", "Gap in long-term stock consistency between platforms.", "sku_reliability_pct", 10);

      setGaps(gapMetrics);
    }

    // Category health (no week column — kept as-is)
    const catData = (catRes.data ?? []) as any[];
    const catMap = new Map<string, Record<string, number | null>>();
    for (const row of catData) {
      const cat = row.business_group_clean as string;
      if (!catMap.has(cat)) catMap.set(cat, {});
      catMap.get(cat)![row.platform as string] = row.availability_pct as number;
    }
    const catRows: CategoryRow[] = Array.from(catMap.entries())
      .map(([category, platforms]) => ({ category, platforms }))
      .sort((a, b) => {
        const avgA = Object.values(a.platforms).reduce((s, v) => s + (v ?? 0), 0) / Object.values(a.platforms).length;
        const avgB = Object.values(b.platforms).reduce((s, v) => s + (v ?? 0), 0) / Object.values(b.platforms).length;
        return avgA - avgB;
      });
    setCategories(catRows);

    // Coverage — pincode locations (aggregate unique locations from filtered data)
    const locByPlatform = new Map<string, Set<string>>();
    for (const row of (pinRes.data ?? []) as any[]) {
      const p = row.platform as string;
      if (!locByPlatform.has(p)) locByPlatform.set(p, new Set());
      locByPlatform.get(p)!.add(row.location as string);
    }

    const weeksByPlatform = new Map<string, Set<string>>();
    for (const row of (weekRes.data ?? []) as any[]) {
      const p = row.platform as string;
      if (!weeksByPlatform.has(p)) weeksByPlatform.set(p, new Set());
      weeksByPlatform.get(p)!.add(row.week as string);
    }

    const coverageRows: CoverageRow[] = [
      {
        label: "SKUs Tracked",
        icon: <Database className="w-3.5 h-3.5 text-muted-foreground" />,
        platforms: Object.fromEntries(plats.map((p) => [p, Math.round(vendors.find((v: any) => v.platform === p)?.skus_tracked ?? 0).toLocaleString()])),
      },
      {
        label: "Locations",
        icon: <MapPin className="w-3.5 h-3.5 text-muted-foreground" />,
        platforms: Object.fromEntries(plats.map((p) => [p, (locByPlatform.get(p)?.size ?? 0).toLocaleString()])),
      },
      {
        label: "Weeks of Data",
        icon: <Calendar className="w-3.5 h-3.5 text-muted-foreground" />,
        platforms: Object.fromEntries(plats.map((p) => [p, (weeksByPlatform.get(p)?.size ?? 0).toLocaleString()])),
      },
    ];
    setCoverage(coverageRows);
    setLoading(false);
  }

  /* ---- SoS loader ---- */
  async function loadSos() {
    const fromISO = dateRange.from.toISOString();
    const toISO = dateRange.to.toISOString();

    const [vendorRes, riskRes, weekRes] = await Promise.all([
      supabase.from("sos_vendor_health_mat").select("*")
        .gte("week", fromISO)
        .lte("week", toISO),
      supabase.from("sos_keyword_risk_mat").select("search_keyword, performance_band, platform, week")
        .gte("week", fromISO)
        .lte("week", toISO),
      supabase.from("sos_weekly_trend_mat").select("platform, week")
        .gte("week", fromISO)
        .lte("week", toISO),
    ]);

    // Aggregate vendor health by platform
    const vendorsRaw = (vendorRes.data ?? []) as any[];
    const vendors = aggregateByPlatform(
      vendorsRaw,
      ["top10_presence_pct", "elite_rank_share_pct", "avg_rank_volatility", "organic_share_pct", "keywords_tracked"]
    );
    const plats = vendors.map((r: any) => r.platform as string);
    setPlatforms(plats);

    // Vendor gaps
    if (plats.length === 2) {
      const [a, b] = vendors;
      const gapMetrics: VendorGap[] = [];

      const addGap = (label: string, tooltip: string, key: string, thresholdPP: number, isInverse = false) => {
        const va = (a[key] ?? 0) as number;
        const vb = (b[key] ?? 0) as number;
        const gapVal = Math.abs(va - vb);
        const isPct = key.includes("pct");
        const gapPP = isPct ? gapVal * 100 : gapVal;
        gapMetrics.push({
          metric: label,
          tooltip,
          platforms: { [a.platform]: va, [b.platform]: vb },
          gap: gapVal,
          gapLabel: isPct ? `${gapPP.toFixed(1)}pp` : gapVal.toFixed(2),
          status: gapStatus(gapPP, thresholdPP),
        });
      };

      addGap("Page 1 Presence", "Gap in top-10 search result presence between platforms.", "top10_presence_pct", 5);
      addGap("Elite Share", "Gap in top-3 ranking share between platforms.", "elite_rank_share_pct", 5);
      addGap("Rank Stability", "Difference in average rank movement between platforms.", "avg_rank_volatility", 2, true);

      setGaps(gapMetrics);
    }

    // Category = performance band distribution per platform (aggregate across weeks — mode per keyword)
    const riskData = (riskRes.data ?? []) as any[];
    // First aggregate by keyword+platform to get a single band per keyword
    const kwBandMap = new Map<string, { bands: string[]; platform: string }>();
    for (const row of riskData) {
      const key = `${row.search_keyword}||${row.platform}`;
      if (!kwBandMap.has(key)) kwBandMap.set(key, { bands: [], platform: row.platform });
      if (row.performance_band) kwBandMap.get(key)!.bands.push(row.performance_band);
    }
    // Then count bands per platform
    const bandMap = new Map<string, Record<string, number>>();
    for (const entry of kwBandMap.values()) {
      // Mode band
      const bandCounts = new Map<string, number>();
      for (const b of entry.bands) bandCounts.set(b, (bandCounts.get(b) ?? 0) + 1);
      let modeBand = entry.bands[0] ?? "Unknown";
      let maxCount = 0;
      for (const [b, c] of bandCounts) { if (c > maxCount) { modeBand = b; maxCount = c; } }
      if (!bandMap.has(modeBand)) bandMap.set(modeBand, {});
      bandMap.get(modeBand)![entry.platform] = (bandMap.get(modeBand)![entry.platform] ?? 0) + 1;
    }
    const bandOrder = ["Elite", "Strong", "Moderate", "Weak"];
    const catRows: CategoryRow[] = bandOrder
      .filter((b) => bandMap.has(b))
      .map((band) => ({
        category: band,
        platforms: bandMap.get(band) ?? {},
      }));
    setCategories(catRows);

    // Coverage
    const weeksByPlatform = new Map<string, Set<string>>();
    for (const row of (weekRes.data ?? []) as any[]) {
      const p = row.platform as string;
      if (!weeksByPlatform.has(p)) weeksByPlatform.set(p, new Set());
      weeksByPlatform.get(p)!.add(row.week as string);
    }

    const coverageRows: CoverageRow[] = [
      {
        label: "Keywords Tracked",
        icon: <Database className="w-3.5 h-3.5 text-muted-foreground" />,
        platforms: Object.fromEntries(plats.map((p) => [p, Math.round(vendors.find((v: any) => v.platform === p)?.keywords_tracked ?? 0).toLocaleString()])),
      },
      {
        label: "Weeks of Data",
        icon: <Calendar className="w-3.5 h-3.5 text-muted-foreground" />,
        platforms: Object.fromEntries(plats.map((p) => [p, (weeksByPlatform.get(p)?.size ?? 0).toLocaleString()])),
      },
    ];
    setCoverage(coverageRows);
    setLoading(false);
  }

  /* ---- Render ---- */
  const categoryLabel = variant === "ola" ? "Category Availability" : "Keyword Performance Bands";
  const categoryTooltip = variant === "ola"
    ? "Availability % by business group per platform. Sorted by weakest first."
    : "Number of keywords in each competitive position band per platform.";
  const formatCatValue = variant === "ola"
    ? (v: number) => `${(v * 100).toFixed(1)}%`
    : (v: number) => v.toLocaleString();

  const getCatValueColor = (v: number | null) => {
    if (v == null) return "text-muted-foreground";
    if (variant === "ola") {
      if (v >= 0.85) return "text-status-success";
      if (v >= 0.7) return "text-status-warning";
      return "text-status-danger";
    }
    return "text-foreground";
  };

  return (
    <section>
      <SectionHeader
        title="Execution Diagnostics"
        subtitle="Structural execution insights across platforms"
      />

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">

          {/* ---- Panel 1: Vendor Performance Gaps ---- */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Performance Gaps</h4>
              <MetricTooltip definition="Difference in key metrics between platforms. Green = aligned, amber = diverging, red = significant gap." />
            </div>

            <div className="space-y-3">
              {gaps.map((g) => (
                <div key={g.metric} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{g.metric}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_STYLES[g.status]}`}>
                      {g.gapLabel} gap
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {platforms.map((p) => {
                      const val = g.platforms[p];
                      const isPct = g.metric !== "Rank Stability";
                      return (
                        <div key={p} className="flex-1 flex items-center justify-between bg-muted/30 rounded px-2.5 py-1.5">
                          <span className={`text-[10px] uppercase tracking-wide ${p === "dmart" ? "text-platform-dmart" : "text-platform-jiomart"}`}>
                            {capitalize(p)}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {isPct ? `${(val * 100).toFixed(1)}%` : val.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Panel 2: Category Comparison ---- */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">{categoryLabel}</h4>
              <MetricTooltip definition={categoryTooltip} />
            </div>

            {/* Header */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `1fr ${platforms.map(() => "80px").join(" ")}` }}>
              <span className="text-[10px] text-muted-foreground uppercase">
                {variant === "ola" ? "Category" : "Band"}
              </span>
              {platforms.map((p) => (
                <span key={p} className={`text-[10px] uppercase text-center ${p === "dmart" ? "text-platform-dmart" : "text-platform-jiomart"}`}>
                  {capitalize(p)}
                </span>
              ))}
            </div>

            <div className="space-y-1">
              {categories.map((row) => (
                <div
                  key={row.category}
                  className="grid gap-2 items-center py-1.5 border-b border-border/20 last:border-0"
                  style={{ gridTemplateColumns: `1fr ${platforms.map(() => "80px").join(" ")}` }}
                >
                  <span className="text-xs text-foreground truncate" title={row.category}>
                    {row.category}
                  </span>
                  {platforms.map((p) => {
                    const v = row.platforms[p] ?? null;
                    return (
                      <span key={p} className={`text-xs font-semibold text-center ${getCatValueColor(v)}`}>
                        {v != null ? formatCatValue(v) : "—"}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ---- Panel 3: Data Coverage ---- */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Data Coverage</h4>
              <MetricTooltip definition="Tracking breadth per platform. Uneven coverage may affect metric comparability." />
            </div>

            <div className="space-y-3">
              {coverage.map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    {row.icon}
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {platforms.map((p) => (
                      <div key={p} className="flex-1 flex items-center justify-between bg-muted/30 rounded px-2.5 py-1.5">
                        <span className={`text-[10px] uppercase tracking-wide ${p === "dmart" ? "text-platform-dmart" : "text-platform-jiomart"}`}>
                          {capitalize(p)}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {row.platforms[p] ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Coverage imbalance callout */}
              {platforms.length === 2 && coverage.length > 0 && (() => {
                const first = coverage[0];
                const v0 = parseInt(first.platforms[platforms[0]]?.replace(/,/g, "") ?? "0");
                const v1 = parseInt(first.platforms[platforms[1]]?.replace(/,/g, "") ?? "0");
                const ratio = v0 > 0 && v1 > 0 ? Math.max(v0, v1) / Math.min(v0, v1) : 1;
                if (ratio > 1.5) {
                  return (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-status-warning/10 border border-status-warning/20">
                      <p className="text-[10px] text-status-warning leading-snug">
                        Coverage imbalance detected — {capitalize(platforms[0])} tracks {first.platforms[platforms[0]]} {first.label.toLowerCase()} vs {first.platforms[platforms[1]]} on {capitalize(platforms[1])}. Cross-platform comparisons may not be fully representative.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
