import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "./SectionHeader";
import { MetricTooltip } from "./MetricTooltip";
import { ArrowRight, Database, MapPin, Calendar, BarChart3, AlertTriangle } from "lucide-react";

interface VendorGap {
  metric: string;
  tooltip: string;
  platforms: Record<string, number>;
  gap: number;
  gapLabel: string;
  status: "success" | "warning" | "danger";
  isPct: boolean;
}

interface CategoryRow {
  category: string;
  platforms: Record<string, number | null>;
}

interface CoverageRow {
  label: string;
  icon: React.ReactNode;
  platforms: Record<string, string>;
  imbalance?: string | null;
}

interface ExecutionDiagnosticsProps {
  variant: "ola" | "sos";
}

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

export function ExecutionDiagnostics({ variant }: ExecutionDiagnosticsProps) {
  const [gaps, setGaps] = useState<VendorGap[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [coverage, setCoverage] = useState<CoverageRow[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (variant === "ola") {
      loadOla();
    } else {
      loadSos();
    }
  }, [variant]);

  async function loadOla() {
    const [vendorRes, catRes, pinRes, weekRes] = await Promise.all([
      supabase.from("ola_vendor_health_mat").select("platform, skus_tracked, availability_pct, must_have_availability_pct, sku_reliability_pct"),
      supabase.from("ola_category_health_mat").select("business_group, availability_pct, platform"),
      supabase.from("ola_pincode_volatility_mat").select("platform, location, avg_availability, volatility_index"),
      supabase.from("ola_weekly_trend_mat").select("platform, week"),
    ]);

    const vendors = (vendorRes.data ?? []).filter((r: any) => r.platform);
    const plats = vendors.map((r: any) => r.platform as string);
    setPlatforms(plats);

    // Vendor gaps
    if (plats.length === 2) {
      const [a, b] = vendors as any[];
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
          isPct: true,
        });
      };

      addGap("Availability", "Overall availability % gap between platforms.", "availability_pct", 5);
      addGap("Must-Have Avail %", "Gap in must-have SKU availability between platforms. Target: ≥90%.", "must_have_availability_pct", 5);
      addGap("SKU Reliability %", "Gap in SKU reliability (% of SKUs with ≥80% availability) between platforms.", "sku_reliability_pct", 5);
      setGaps(gapMetrics);
    }

    // Category health
    const catData = (catRes.data ?? []) as any[];
    const catMap = new Map<string, Record<string, number | null>>();
    for (const row of catData) {
      const cat = row.business_group as string;
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

    // Coverage
    const locByPlatform = new Map<string, Set<string>>();
    for (const row of (pinRes.data ?? []) as any[]) {
      const p = row.platform as string;
      if (!locByPlatform.has(p)) locByPlatform.set(p, new Set());
      locByPlatform.get(p)!.add(row.location as string);
    }

    // Weeks of data
    const weeksByPlatform = new Map<string, Set<string>>();
    for (const row of (weekRes.data ?? []) as any[]) {
      const p = row.platform as string;
      if (!weeksByPlatform.has(p)) weeksByPlatform.set(p, new Set());
      weeksByPlatform.get(p)!.add(row.week as string);
    }

    const skuCounts = plats.map((p) => (vendors.find((v: any) => v.platform === p) as any)?.skus_tracked ?? 0);
    const skuImbalance = plats.length === 2 && Math.max(...skuCounts) / Math.max(Math.min(...skuCounts), 1) > 1.5
      ? `${(Math.max(...skuCounts) / Math.max(Math.min(...skuCounts), 1)).toFixed(1)}x coverage imbalance`
      : null;

    const coverageRows: CoverageRow[] = [
      {
        label: "SKUs Tracked",
        icon: <Database className="w-3.5 h-3.5 text-muted-foreground" />,
        platforms: Object.fromEntries(plats.map((p) => [p, Math.round((vendors.find((v: any) => v.platform === p) as any)?.skus_tracked ?? 0).toLocaleString()])),
        imbalance: skuImbalance,
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

  async function loadSos() {
    const [vendorRes, riskRes, weekRes] = await Promise.all([
      supabase.from("sos_vendor_health_mat").select("platform, keywords_tracked, top10_presence_pct, elite_rank_share_pct, avg_rank_volatility"),
      supabase.from("sos_keyword_risk_mat").select("search_keyword, performance_band, platform"),
      supabase.from("sos_weekly_trend_mat").select("platform, week"),
    ]);

    const vendors = (vendorRes.data ?? []).filter((r: any) => r.platform);
    const plats = vendors.map((r: any) => r.platform as string);
    setPlatforms(plats);

    // Vendor gaps
    if (plats.length === 2) {
      const [a, b] = vendors as any[];
      const gapMetrics: VendorGap[] = [];

      const addGapPct = (label: string, tooltip: string, key: string, thresholdPP: number) => {
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
          isPct: true,
        });
      };

      const addGapNum = (label: string, tooltip: string, key: string, threshold: number) => {
        const va = (a[key] ?? 0) as number;
        const vb = (b[key] ?? 0) as number;
        const gapVal = Math.abs(va - vb);
        gapMetrics.push({
          metric: label,
          tooltip,
          platforms: { [a.platform]: va, [b.platform]: vb },
          gap: gapVal,
          gapLabel: gapVal.toFixed(2),
          status: gapStatus(gapVal, threshold),
          isPct: false,
        });
      };

      addGapPct("Page 1 Presence", "Gap in top-10 search result presence between platforms.", "top10_presence_pct", 5);
      addGapPct("Elite Share %", "Gap in rank 1–3 share between platforms.", "elite_rank_share_pct", 5);
      addGapNum("Rank Stability", "Difference in average rank volatility. Lower volatility = more stable.", "avg_rank_volatility", 2);
      setGaps(gapMetrics);
    }

    // Keyword risk bands
    const riskData = (riskRes.data ?? []) as any[];
    const bandMap = new Map<string, Record<string, number>>();
    for (const row of riskData) {
      const band = row.performance_band as string;
      if (!band) continue;
      if (!bandMap.has(band)) bandMap.set(band, {});
      bandMap.get(band)![row.platform as string] = (bandMap.get(band)![row.platform as string] ?? 0) + 1;
    }
    const bandOrder = ["Elite", "Strong", "Moderate", "Weak"];
    const catRows: CategoryRow[] = bandOrder
      .filter((b) => bandMap.has(b))
      .map((band) => ({
        category: band,
        platforms: bandMap.get(band) ?? {},
      }));
    setCategories(catRows);

    // Weeks of data
    const weeksByPlatform = new Map<string, Set<string>>();
    for (const row of (weekRes.data ?? []) as any[]) {
      const p = row.platform as string;
      if (!weeksByPlatform.has(p)) weeksByPlatform.set(p, new Set());
      weeksByPlatform.get(p)!.add(row.week as string);
    }

    // Coverage
    const coverageRows: CoverageRow[] = [
      {
        label: "Keywords Tracked",
        icon: <Database className="w-3.5 h-3.5 text-muted-foreground" />,
        platforms: Object.fromEntries(plats.map((p) => [p, Math.round((vendors.find((v: any) => v.platform === p) as any)?.keywords_tracked ?? 0).toLocaleString()])),
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
          {/* Panel 1: Performance Gaps */}
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
                      return (
                        <div key={p} className="flex-1 flex items-center justify-between bg-muted/30 rounded px-2.5 py-1.5">
                          <span className={`text-[10px] uppercase tracking-wide ${p === "dmart" ? "text-platform-dmart" : "text-platform-jiomart"}`}>
                            {capitalize(p)}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {g.isPct ? `${(val * 100).toFixed(1)}%` : val.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Category Comparison */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">{categoryLabel}</h4>
              <MetricTooltip definition={categoryTooltip} />
            </div>
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

          {/* Panel 3: Data Coverage */}
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
                  {row.imbalance && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <AlertTriangle className="w-3 h-3 text-status-warning" />
                      <span className="text-[10px] text-status-warning font-medium">{row.imbalance}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
