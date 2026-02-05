import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InlineInsight } from "@/components/dashboard/InlineInsight";
import { RankedList } from "@/components/dashboard/RankedList";
import { SearchVisibilityTrendChart } from "@/components/dashboard/SearchVisibilityTrendChart";
import { Search, TrendingUp, TrendingDown, Hash, Eye, BarChart3, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { sosKPIs, sosRankDistribution, sosVisibilityByType, sosKeywordRankings, sosTopPerformers, sosBottomPerformers } from "@/data/mockData";
import { useDateRange } from "@/contexts/DateRangeContext";

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

export default function ShareOfSearch() {
  const { getTimePhrase } = useDateRange();

  // Time-aware insights
  const sosInsights = [
    {
      id: "1",
      type: "alert" as const,
      title: "Rank drop: Instant Noodles keywords",
      description: `3 keywords dropped below position 20 ${getTimePhrase()}.`,
    },
    {
      id: "2",
      type: "warning" as const,
      title: "Declining visibility in Sponsored",
      description: `12 keywords lost sponsored placement ${getTimePhrase()}. Review bid strategy.`,
    },
    {
      id: "3",
      type: "info" as const,
      title: "Strong organic performance",
      description: `5 new keywords entered top 3 organic positions ${getTimePhrase()}.`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* LEVEL 1: Summary - Rank performance at a glance */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Search Rank Performance</h2>
              <p className="text-sm text-muted-foreground">Position tracking across {sosKPIs.keywordsTracked.value} keywords</p>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-6">
            {/* Primary Metric - Average Rank */}
            <div className="text-center border-r border-border pr-6">
              <p className="text-5xl font-bold text-foreground">#{sosKPIs.avgSearchRank.value}</p>
              <p className="text-sm text-muted-foreground mt-1">Average Rank</p>
              <div className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${sosKPIs.avgSearchRank.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                {sosKPIs.avgSearchRank.trend.direction === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {sosKPIs.avgSearchRank.trend.value} positions
              </div>
            </div>
            
            {/* Rank Distribution Metrics */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-status-success" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">In Top 3</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{sosKPIs.keywordsInTop3.value}</p>
              <span className="text-xs text-status-success">+{sosKPIs.keywordsInTop3.trend.value} this week</span>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-status-info" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">In Top 10</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{sosKPIs.keywordsInTop10.value}</p>
              <span className="text-xs text-status-success">+{sosKPIs.keywordsInTop10.trend.value} this week</span>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-status-error" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Below Top 20</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{sosKPIs.keywordsBelowTop20.value}</p>
              <span className="text-xs text-status-success">-{Math.abs(sosKPIs.keywordsBelowTop20.trend.value)} this week</span>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Tracked</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{sosKPIs.keywordsTracked.value}</p>
              <span className="text-xs text-status-success">+{sosKPIs.keywordsTracked.trend.value} new</span>
            </div>
          </div>
        </div>

        {/* LEVEL 2: Primary Temporal Visual */}
        <SearchVisibilityTrendChart />

        {/* LEVEL 2.5: Breakdown - Rank Distribution + Visibility by Result Type */}
        <div className="grid grid-cols-2 gap-6">
          {/* Rank Distribution */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-foreground">Rank Distribution</h3>
              <p className="text-sm text-muted-foreground">Keywords grouped by position bucket</p>
            </div>
          
            <div className="space-y-3">
              {sosRankDistribution.map((bucket) => (
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

          {/* Visibility by Result Type */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-foreground">Visibility by Result Type</h3>
              <p className="text-sm text-muted-foreground">Presence in organic vs sponsored results</p>
            </div>
            
            <div className="space-y-4">
              {sosVisibilityByType.map((item) => (
                <div key={item.type} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{item.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Avg Rank: #{item.avgRank}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{item.keywordsPresent}</p>
                      <p className="text-xs text-muted-foreground">keywords present</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-status-success">{item.inTop10}</p>
                      <p className="text-xs text-muted-foreground">in top 10</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LEVEL 2.5: Keyword Rank Tracking Table */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-foreground">Keyword Rankings</h3>
            <p className="text-sm text-muted-foreground">Individual keyword position tracking</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Keyword</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Rank</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Result Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Product</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sosKeywordRankings.slice(0, 8).map((item, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-2">
                      <span className="text-sm font-medium text-foreground">{item.keyword}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-7 rounded text-sm font-bold ${getRankBg(item.rank)} ${getRankColor(item.rank)}`}>
                        #{item.rank}
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
                ))}
              </tbody>
            </table>
            <button className="mt-4 text-sm text-primary hover:underline">View all {sosKPIs.keywordsTracked.value} keywords →</button>
          </div>
        </div>

        {/* LEVEL 3: Diagnostics - Insights + Rankings */}
        <div className="grid grid-cols-3 gap-6">
          {/* Insights Column */}
          <div className="col-span-1 space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Insights</h3>
            {sosInsights.map((insight) => (
              <InlineInsight
                key={insight.id}
                type={insight.type}
                title={insight.title}
                description={insight.description}
              />
            ))}
          </div>
          
          {/* Rankings - Side by side */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <RankedList
              title="Best Positions"
              subtitle="Highest ranking keywords"
              items={sosTopPerformers.slice(0, 4)}
            />
            <RankedList
              title="Needs Attention"
              subtitle="Lowest ranking keywords"
              items={sosBottomPerformers.slice(0, 4)}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}