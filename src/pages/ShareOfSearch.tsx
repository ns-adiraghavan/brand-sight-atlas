import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchVisibilityTrendChart } from "@/components/dashboard/SearchVisibilityTrendChart";
import { DataStatusIndicator, useDataStatus } from "@/components/dashboard/DataStatusIndicator";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TrendingUp, TrendingDown, Hash, Eye, Target } from "lucide-react";
import { AlignmentInsight } from "@/components/dashboard/AlignmentInsight";
import { useDateRange } from "@/contexts/DateRangeContext";
import { CHART_LIMITS } from "@/lib/metrics";
import { applyProbabilisticLanguage } from "@/lib/insights";
import { supabase } from "@/integrations/supabase/client";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { VendorHealthOverview } from "@/components/dashboard/VendorHealthOverview";

interface ExecSummary {
  platform: string;
  top10_presence_pct: number;
  elite_rank_share_pct: number;
  exclusive_share_pct: number;
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
  const { preset, getTimePhrase } = useDateRange();
  const dataStatus = useDataStatus(preset);

  const [exec, setExec] = useState<ExecSummary[]>([]);
  const [rankDist, setRankDist] = useState<{ bucket: string; count: number; pctOfTotal: number }[]>([]);
  const [volatility, setVolatility] = useState<KeywordVolatility[]>([]);
  const [risk, setRisk] = useState<KeywordRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("sos_exec_summary_mat").select("platform, top10_presence_pct, elite_rank_share_pct, exclusive_share_pct"),
      supabase.from("sos_rank_distribution_mat").select("rank_bucket, listing_count, platform"),
      supabase.from("sos_keyword_volatility_mat").select("search_keyword, mean_rank, rank_volatility, platform").order("rank_volatility", { ascending: false }).limit(20),
      supabase.from("sos_keyword_risk_mat").select("search_keyword, mean_rank, performance_band, platform").limit(CHART_LIMITS.maxRows),
    ]).then(([execRes, distRes, volRes, riskRes]) => {
      if (execRes.data) setExec(execRes.data as ExecSummary[]);

      if (distRes.data) {
        // Aggregate across platforms
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

      if (volRes.data) setVolatility(volRes.data as KeywordVolatility[]);
      if (riskRes.data) setRisk(riskRes.data as KeywordRisk[]);

      setLoading(false);
    });
  }, []);

  // Aggregated KPIs
  const avgTop10 = exec.length > 0 ? exec.reduce((s, d) => s + d.top10_presence_pct, 0) / exec.length : null;
  const avgElite = exec.length > 0 ? exec.reduce((s, d) => s + d.elite_rank_share_pct, 0) / exec.length : null;

  const execInsight = applyProbabilisticLanguage(
    `Search visibility ${avgTop10 && avgTop10 > 0.4 ? "holds a solid base" : "faces structural constraints"} ${getTimePhrase()}, with ${avgElite && avgElite > 0.3 ? "healthy elite positioning" : "elite share requiring attention"}. Sustaining momentum will depend on keyword-level consistency and proactive competitive response.`,
    dataStatus.coverage
  );

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ===== SECTION 0: VENDOR HEALTH ===== */}
        <VendorHealthOverview />

        {/* ===== SECTION 1: EXECUTIVE SNAPSHOT ===== */}
        <section>
          <SectionHeader
            title="Executive Snapshot"
            subtitle="Key visibility metrics at a glance"
            action={<DataStatusIndicator status={dataStatus} />}
          />

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-foreground leading-relaxed">{execInsight}</p>
          </div>

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
                          <span className="font-medium text-foreground">Top10: {(p.top10_presence_pct * 100).toFixed(1)}%</span>
                          <span className="font-medium text-foreground">Elite: {(p.elite_rank_share_pct * 100).toFixed(1)}%</span>
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

        {/* ===== SECTION 3: DIAGNOSTICS ===== */}
        <section>
          <SectionHeader
            title="Diagnostics"
            subtitle="Position structure, instability signals, and action priorities"
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

          {/* Risk Band Table — full width */}
          <div className="mt-3 bg-card rounded-xl border border-border p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground">Keyword Risk Classification</h3>
              <p className="text-sm text-muted-foreground">Keywords by competitive position band</p>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Keyword</th>
                      <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Mean Rank</th>
                      <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Risk Band</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risk.map((item, idx) => {
                      const meanRank = Number(item.mean_rank);
                      return (
                        <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-2">
                            <span className="text-sm font-medium text-foreground">{item.search_keyword}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center justify-center w-10 h-7 rounded text-sm font-bold ${getRankBg(meanRank)} ${getRankColor(meanRank)}`}>
                              #{meanRank.toFixed(0)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRiskBandStyle(item.performance_band)}`}>
                              {item.performance_band}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm text-muted-foreground capitalize">{item.platform}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
