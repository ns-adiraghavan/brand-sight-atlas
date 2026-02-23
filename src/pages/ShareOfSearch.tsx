import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchVisibilityTrendChart } from "@/components/dashboard/SearchVisibilityTrendChart";
import { DataStatusIndicator, useDataStatus } from "@/components/dashboard/DataStatusIndicator";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Target } from "lucide-react";
import { AlignmentInsight } from "@/components/dashboard/AlignmentInsight";
import { useDateRange } from "@/contexts/DateRangeContext";
import { supabase } from "@/integrations/supabase/client";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { VendorHealthOverview } from "@/components/dashboard/VendorHealthOverview";
import { KeyTakeaways } from "@/components/dashboard/KeyTakeaways";
import { ExecutionDiagnostics } from "@/components/dashboard/ExecutionDiagnostics";
import { aggregateSosHealth } from "@/lib/aggregation";

interface ExecSummary {
  platform: string;
  top10_presence_pct: number | null;
  elite_rank_share_pct: number | null;
  keywords_tracked: number;
}

interface RankDistRow {
  rank_bucket: string;
  listing_count: number;
  platform: string;
}

interface KeywordVolatility {
  search_keyword: string;
  mean_rank: number;
  rank_volatility: number;
  platform: string;
}

interface KeywordRisk {
  search_keyword: string;
  mean_rank: number;
  performance_band: string;
  platform: string;
}

const getRankColor = (rank: number) => {
  if (rank <= 3) return "text-status-success";
  if (rank <= 10) return "text-status-info";
  if (rank <= 20) return "text-status-warning";
  return "text-status-error";
};

const getRankBg = (rank: number) => {
  if (rank <= 3) return "bg-status-success/10";
  if (rank <= 10) return "bg-status-info/10";
  if (rank <= 20) return "bg-status-warning/10";
  return "bg-status-error/10";
};

const getRiskBandStyle = (band: string) => {
  switch (band) {
    case "Elite": return "bg-status-success/10 text-status-success";
    case "Strong": return "bg-status-info/10 text-status-info";
    case "Moderate": return "bg-status-warning/10 text-status-warning";
    case "Weak": return "bg-status-error/10 text-status-error";
    default: return "bg-muted text-muted-foreground";
  }
};

const BUCKET_ORDER = ["1–3", "4–10", "11–25", "Below 20"];
const BUCKET_COLORS: Record<string, string> = {
  "1–3": "bg-status-success/60",
  "4–10": "bg-status-info/60",
  "11–25": "bg-status-warning/60",
  "Below 20": "bg-status-error/60",
};

export default function ShareOfSearch() {
  const { preset, getTimePhrase, dateRange } = useDateRange();
  const dataStatus = useDataStatus(preset);

  const [exec, setExec] = useState<ExecSummary[]>([]);
  const [rankDist, setRankDist] = useState<{ bucket: string; count: number; pctOfTotal: number }[]>([]);
  const [volatility, setVolatility] = useState<KeywordVolatility[]>([]);
  const [risk, setRisk] = useState<KeywordRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fromISO = dateRange.from.toISOString();
    const toISO = dateRange.to.toISOString();

    Promise.all([
      supabase.from("sos_vendor_health_mat")
        .select("platform, top10_keywords, elite_keywords, total_keywords, week")
        .gte("week", fromISO)
        .lte("week", toISO),
      supabase.from("sos_rank_distribution_mat")
        .select("rank_bucket, listing_count, platform, week")
        .gte("week", fromISO)
        .lte("week", toISO),
      supabase.from("sos_keyword_volatility_mat")
        .select("search_keyword, mean_rank, rank_volatility, platform, week")
        .gte("week", fromISO)
        .lte("week", toISO)
        .order("rank_volatility", { ascending: false })
        .limit(200),
      supabase.from("sos_keyword_risk_mat")
        .select("search_keyword, mean_rank, performance_band, platform, week")
        .gte("week", fromISO)
        .lte("week", toISO)
        .limit(200),
    ]).then(([execRes, distRes, volRes, riskRes]) => {
      // Exec summary: weighted aggregation from counts
      if (execRes.data) {
        const filtered = execRes.data.filter((r: any) => r.platform);
        setExec(aggregateSosHealth(filtered as any) as ExecSummary[]);
      }

      // Rank distribution: SUM listing_count by rank_bucket (across weeks + platforms)
      if (distRes.data) {
        const bucketMap = new Map<string, number>();
        for (const row of distRes.data as RankDistRow[]) {
          if (row.rank_bucket && row.listing_count != null) {
            bucketMap.set(row.rank_bucket, (bucketMap.get(row.rank_bucket) || 0) + Number(row.listing_count));
          }
        }
        const total = Array.from(bucketMap.values()).reduce((s, v) => s + v, 0);
        const ordered = BUCKET_ORDER.filter((b) => bucketMap.has(b)).map((b) => ({
          bucket: b,
          count: bucketMap.get(b)!,
          pctOfTotal: total > 0 ? Math.round((bucketMap.get(b)! / total) * 100) : 0,
        }));
        setRankDist(ordered);
      }

      // Keyword volatility: aggregate by keyword+platform (AVG mean_rank, AVG rank_volatility)
      if (volRes.data) {
        const kwMap = new Map<string, { sum_rank: number; sum_vol: number; count: number; platform: string; search_keyword: string }>();
        for (const row of volRes.data as any[]) {
          const key = `${row.search_keyword}||${row.platform}`;
          if (!kwMap.has(key)) kwMap.set(key, { sum_rank: 0, sum_vol: 0, count: 0, platform: row.platform, search_keyword: row.search_keyword });
          const entry = kwMap.get(key)!;
          entry.sum_rank += Number(row.mean_rank ?? 0);
          entry.sum_vol += Number(row.rank_volatility ?? 0);
          entry.count += 1;
        }
        const aggVol = Array.from(kwMap.values()).map((e) => ({
          search_keyword: e.search_keyword,
          mean_rank: e.sum_rank / e.count,
          rank_volatility: e.sum_vol / e.count,
          platform: e.platform,
        }));
        aggVol.sort((a, b) => b.rank_volatility - a.rank_volatility);
        setVolatility(aggVol.slice(0, 20));
      }

      // Keyword risk: take the latest performance_band per keyword+platform (mode across weeks)
      if (riskRes.data) {
        const kwMap = new Map<string, { sum_rank: number; count: number; bands: string[]; platform: string; search_keyword: string }>();
        for (const row of riskRes.data as any[]) {
          const key = `${row.search_keyword}||${row.platform}`;
          if (!kwMap.has(key)) kwMap.set(key, { sum_rank: 0, count: 0, bands: [], platform: row.platform, search_keyword: row.search_keyword });
          const entry = kwMap.get(key)!;
          entry.sum_rank += Number(row.mean_rank ?? 0);
          entry.count += 1;
          if (row.performance_band) entry.bands.push(row.performance_band);
        }
        const aggRisk = Array.from(kwMap.values()).map((e) => {
          // Most frequent band
          const bandCounts = new Map<string, number>();
          for (const b of e.bands) bandCounts.set(b, (bandCounts.get(b) ?? 0) + 1);
          let modeBand = e.bands[0] ?? "Unknown";
          let maxCount = 0;
          for (const [b, c] of bandCounts) { if (c > maxCount) { modeBand = b; maxCount = c; } }
          return {
            search_keyword: e.search_keyword,
            mean_rank: e.sum_rank / e.count,
            performance_band: modeBand,
            platform: e.platform,
          };
        });
        setRisk(aggRisk.slice(0, 10));
      }

      setLoading(false);
    });
  }, [dateRange.from.getTime(), dateRange.to.getTime()]);

  // Aggregated KPIs
  const avgTop10 = exec.length > 0 ? exec.reduce((s, d) => s + d.top10_presence_pct, 0) / exec.length : null;
  const avgElite = exec.length > 0 ? exec.reduce((s, d) => s + d.elite_rank_share_pct, 0) / exec.length : null;

  // Build structured 4-part insight
  const platformsSorted = [...exec].sort((a, b) => (b.top10_presence_pct ?? 0) - (a.top10_presence_pct ?? 0));
  const topPlatform = platformsSorted[0];
  const bottomPlatform = platformsSorted[platformsSorted.length - 1];
  const presenceGapPP = topPlatform && bottomPlatform
    ? (((topPlatform.top10_presence_pct ?? 0) - (bottomPlatform.top10_presence_pct ?? 0)) * 100).toFixed(1)
    : null;

  const sosInsightLines: string[] = [];

  // 1. Metric change
  if (avgTop10 != null) {
    sosInsightLines.push(
      `Page 1 presence is at ${(avgTop10 * 100).toFixed(1)}% over the last 30 days.`
    );
  }

  // 2. Vendor comparison
  if (presenceGapPP && topPlatform && bottomPlatform && Number(presenceGapPP) > 0) {
    sosInsightLines.push(
      `${bottomPlatform.platform.charAt(0).toUpperCase() + bottomPlatform.platform.slice(1)} trails ${topPlatform.platform.charAt(0).toUpperCase() + topPlatform.platform.slice(1)} by ${presenceGapPP}pp on page 1 presence.`
    );
  }

  // 3. Interpretation
  if (presenceGapPP && Number(presenceGapPP) > 2) {
    sosInsightLines.push(
      "This gap points to rank drops on the weaker platform, likely from bid or content gaps."
    );
  } else if (avgElite != null && avgElite < 0.3) {
    sosInsightLines.push(
      "Low elite share means few keywords hold top-3 spots, limiting click-through rates."
    );
  }

  // 4. Action
  if (bottomPlatform) {
    sosInsightLines.push(
      `Review keyword bids and content quality for rank-drop keywords on ${bottomPlatform.platform.charAt(0).toUpperCase() + bottomPlatform.platform.slice(1)}.`
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ===== KEY TAKEAWAYS ===== */}
        <KeyTakeaways variant="sos" />

        {/* ===== SECTION 0: VENDOR HEALTH ===== */}
        <VendorHealthOverview variant="sos" />

        {/* ===== SECTION 1: EXECUTIVE SNAPSHOT ===== */}
        <section>
          <SectionHeader
            title="Executive Snapshot"
            subtitle="Key visibility metrics at a glance"
            action={<DataStatusIndicator status={dataStatus} />}
          />

          {sosInsightLines.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 mb-4 space-y-1">
              {sosInsightLines.map((line, i) => (
                <p key={i} className="text-xs text-foreground leading-snug">{line}</p>
              ))}
            </div>
          )}

          <div className="bg-card rounded-xl border border-border p-5">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {/* Top 10 Presence */}
                <div className="text-center border-r border-border pr-6">
                  <p className="text-4xl font-bold text-foreground">
                    {avgTop10 != null ? `${(avgTop10 * 100).toFixed(1)}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Page 1 Presence</p>
                </div>

                {/* Elite Share */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-status-success" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Elite Share</span>
                    <MetricTooltip definition="% of Top 10 listings that rank within positions 1–3." />
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {avgElite != null ? `${(avgElite * 100).toFixed(1)}%` : "—"}
                  </p>
                </div>

                {/* Per-platform breakdown */}
                <div className="col-span-2 flex flex-col justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">By Platform</span>
                  <div className="space-y-1.5">
                    {exec.map((p) => (
                      <div key={p.platform} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground capitalize">{p.platform}</span>
                        <div className="flex gap-4">
                          <span className="font-medium text-foreground">Top10: {((p.top10_presence_pct ?? 0) * 100).toFixed(1)}%</span>
                          <span className="font-medium text-foreground">Elite: {((p.elite_rank_share_pct ?? 0) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== SECTION 2: STRUCTURAL TRENDS ===== */}
        <section>
          <SectionHeader
            title="Structural Trends"
            subtitle="Visibility trajectory and positioning shifts"
          />
          <SearchVisibilityTrendChart />
        </section>

        {/* ===== SECTION 3: EXECUTION DIAGNOSTICS ===== */}
        <ExecutionDiagnostics variant="sos" />

        {/* ===== SECTION 3b: POSITION & INSTABILITY ===== */}
        <section>
          <SectionHeader
            title="Position Analysis"
            subtitle="Rank distribution and instability signals"
          />

          <div className="grid grid-cols-5 gap-4">
            {/* Position Distribution — 60% */}
            <div className="col-span-3 bg-card rounded-xl border border-border p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">Position Distribution</h3>
                <p className="text-sm text-muted-foreground">Listings grouped by rank bucket</p>
              </div>
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
              ) : (
                <div className="space-y-3">
                  {rankDist.map((bucket) => (
                    <div key={bucket.bucket} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-foreground w-20">{bucket.bucket}</span>
                      <div className="flex-1 h-8 bg-muted/30 rounded overflow-hidden relative">
                        <div
                          className={`h-full rounded transition-all ${BUCKET_COLORS[bucket.bucket] || "bg-muted"}`}
                          style={{ width: `${bucket.pctOfTotal}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
                          {bucket.count.toLocaleString()} listings
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{bucket.pctOfTotal}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Keyword Volatility — 40% */}
            <div className="col-span-2 bg-card rounded-xl border border-border p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">Rank Instability</h3>
                <p className="text-sm text-muted-foreground">Highest volatility keywords</p>
              </div>
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
              ) : volatility.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No volatility data</p>
              ) : (
                <div className="space-y-2.5">
                  {volatility.slice(0, 7).map((item, idx) => {
                    const barWidth = Math.min(100, (Number(item.mean_rank) / 25) * 100);
                    const meanRank = Number(item.mean_rank);
                    return (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-foreground truncate max-w-[60%]">{item.search_keyword}</span>
                          <span className="text-[10px] text-muted-foreground capitalize">{item.platform}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold w-7 ${getRankColor(meanRank)}`}>
                            #{meanRank.toFixed(0)}
                          </span>
                          <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
                            <div
                              className={`h-full rounded transition-all ${
                                meanRank <= 3 ? "bg-status-success/50" :
                                meanRank <= 10 ? "bg-status-info/50" :
                                meanRank <= 20 ? "bg-status-warning/50" :
                                "bg-status-error/50"
                              }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-10 text-right">
                            σ{Number(item.rank_volatility).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== SECTION 4: ALIGNMENT ===== */}
        <section>
          <AlignmentInsight />
        </section>
      </div>
    </DashboardLayout>
  );
}
