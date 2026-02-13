import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchVisibilityTrendChart } from "@/components/dashboard/SearchVisibilityTrendChart";
import { DataStatusIndicator, useDataStatus } from "@/components/dashboard/DataStatusIndicator";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TrendingUp, TrendingDown, Hash, Eye, BarChart3, ArrowUp, ArrowDown, Minus, Target } from "lucide-react";
import { sosKPIs, sosRankDistribution, sosKeywordRankings } from "@/data/mockData";
import { AlignmentInsight } from "@/components/dashboard/AlignmentInsight";
import { useDateRange } from "@/contexts/DateRangeContext";
import { CHART_LIMITS } from "@/lib/metrics";
import { applyProbabilisticLanguage } from "@/lib/insights";

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

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <ArrowUp className="w-3 h-3 text-status-success" />;
  if (trend === "down") return <ArrowDown className="w-3 h-3 text-status-error" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

// Derive risk band from rank
const getRiskBand = (rank: number) => {
  if (rank <= 3) return "Elite";
  if (rank <= 10) return "Strong";
  if (rank <= 20) return "Moderate";
  return "Weak";
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

export default function ShareOfSearch() {
  const { preset, getTimePhrase } = useDateRange();
  const dataStatus = useDataStatus(preset);

  // Derived metrics (no new metrics — existing data only)
  const page1PresencePct = Math.round(sosKPIs.keywordsInTop10.value / sosKPIs.keywordsTracked.value * 100);
  const elitePct = Math.round(sosKPIs.keywordsInTop3.value / sosKPIs.keywordsTracked.value * 100);

  // Executive insight — strategic, board-level framing
  const rankDirection = sosKPIs.avgSearchRank.trend.direction === "up" ? "strengthening" : "softening";
  const tailRisk = sosKPIs.keywordsBelowTop20.value > 10 ? "significant" : "contained";
  const page1Gap = page1PresencePct < 60;

  const execInsight = applyProbabilisticLanguage(
    `Search visibility is ${rankDirection} ${getTimePhrase()}, though ${page1Gap ? "Page 1 coverage remains a structural ceiling that limits organic conversion potential" : "momentum is unevenly distributed across the keyword portfolio"}. ${tailRisk === "significant" ? "Defensive positioning on high-intent keywords is critical as tail-keyword erosion signals competitive pressure." : "Sustaining elite rank share will require proactive bid and content strategy as competitive intensity builds."}`,
    dataStatus.coverage
  );

  const displayRankDistribution = sosRankDistribution.slice(0, CHART_LIMITS.maxBars);
  const displayKeywords = sosKeywordRankings.slice(0, CHART_LIMITS.maxRows);

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ===== SECTION 1: EXECUTIVE SNAPSHOT ===== */}
        <section>
          <SectionHeader
            title="Executive Snapshot"
            subtitle="Key visibility metrics at a glance"
            action={<DataStatusIndicator status={dataStatus} />}
          />

          {/* Insight paragraph */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-foreground leading-relaxed">{execInsight}</p>
          </div>

          {/* KPI row */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="grid grid-cols-4 gap-6">
              {/* Average Search Rank */}
              <div className="text-center border-r border-border pr-6">
                <p className="text-4xl font-bold text-foreground">#{sosKPIs.avgSearchRank.value}</p>
                <p className="text-xs text-muted-foreground mt-1">Average Search Rank</p>
                <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${sosKPIs.avgSearchRank.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                  {sosKPIs.avgSearchRank.trend.direction === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {sosKPIs.avgSearchRank.trend.value} positions
                </div>
              </div>

              {/* Page 1 Presence % */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Page 1 Presence</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{page1PresencePct}%</p>
                <span className="text-[10px] text-muted-foreground">rank ≤ 10</span>
              </div>

              {/* Elite Share % */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-status-success" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Elite Share</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{elitePct}%</p>
                <span className={`text-[10px] ${sosKPIs.keywordsInTop3.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                  {sosKPIs.keywordsInTop3.trend.direction === "up" ? "+" : ""}{sosKPIs.keywordsInTop3.trend.value} keywords
                </span>
              </div>

              {/* Keywords Tracked */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Keywords Tracked</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{sosKPIs.keywordsTracked.value}</p>
                <span className="text-[10px] text-status-success">+{sosKPIs.keywordsTracked.trend.value} new</span>
              </div>
            </div>
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

        {/* ===== SECTION 3: DIAGNOSTIC DEEP DIVE ===== */}
        <section>
          <SectionHeader
            title="Diagnostics"
            subtitle="Position structure, instability signals, and action priorities"
          />

          <div className="grid grid-cols-5 gap-4">
            {/* Rank Distribution — 60% */}
            <div className="col-span-3 bg-card rounded-xl border border-border p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">Position Distribution</h3>
                <p className="text-sm text-muted-foreground">Keywords grouped by position bucket</p>
              </div>
              <div className="space-y-3">
                {displayRankDistribution.map((bucket) => (
                  <div key={bucket.bucket} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground w-20">{bucket.bucket}</span>
                    <div className="flex-1 h-8 bg-muted/30 rounded overflow-hidden relative">
                      <div
                        className={`h-full rounded transition-all ${
                          bucket.bucket === "Top 3" ? "bg-status-success/60" :
                          bucket.bucket === "4-10" ? "bg-status-info/60" :
                          bucket.bucket === "11-20" ? "bg-status-warning/60" :
                          "bg-status-error/60"
                        }`}
                        style={{ width: `${bucket.pctOfTotal}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
                        {bucket.count} keywords
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{bucket.pctOfTotal}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Volatility — 40% (ranked bar: mean rank vs instability) */}
            <div className="col-span-2 bg-card rounded-xl border border-border p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">Rank Instability</h3>
                <p className="text-sm text-muted-foreground">Mean rank vs. movement direction</p>
              </div>
              <div className="space-y-2.5">
                {displayKeywords.slice(0, 7).map((item, idx) => {
                  // Simulate volatility bar width from rank (wider = worse rank = more exposed)
                  const barWidth = Math.min(100, (item.rank / 50) * 100);
                  const band = getRiskBand(item.rank);
                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground truncate max-w-[60%]">{item.keyword}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getRiskBandStyle(band)}`}>{band}</span>
                          <TrendIcon trend={item.trend} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-7 ${getRankColor(item.rank)}`}>#{item.rank}</span>
                        <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
                          <div
                            className={`h-full rounded transition-all ${
                              item.rank <= 3 ? "bg-status-success/50" :
                              item.rank <= 10 ? "bg-status-info/50" :
                              item.rank <= 20 ? "bg-status-warning/50" :
                              "bg-status-error/50"
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Risk Band Table — full width */}
          <div className="mt-3 bg-card rounded-xl border border-border p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground">Keyword Risk Classification</h3>
              <p className="text-sm text-muted-foreground">Keywords by competitive position band</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Keyword</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Rank</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Risk Band</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Result Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Product</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {displayKeywords.map((item, idx) => {
                    const band = getRiskBand(item.rank);
                    return (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-2">
                          <span className="text-sm font-medium text-foreground">{item.keyword}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center justify-center w-10 h-7 rounded text-sm font-bold ${getRankBg(item.rank)} ${getRankColor(item.rank)}`}>
                            #{item.rank}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRiskBandStyle(band)}`}>
                            {band}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-muted-foreground">{item.resultType}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-foreground">{item.product}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <TrendIcon trend={item.trend} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {sosKeywordRankings.length > CHART_LIMITS.maxRows && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Showing {CHART_LIMITS.maxRows} of {sosKeywordRankings.length} keywords
                </p>
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
