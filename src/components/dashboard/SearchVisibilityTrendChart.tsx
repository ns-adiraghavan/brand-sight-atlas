import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { useDateRange } from "@/contexts/DateRangeContext";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";
import { CHART_LIMITS, hasValidData, PLACEHOLDER_MESSAGES } from "@/lib/metrics";

// Generate mock temporal data based on date range
// Grain: Keyword × Rank × Day, aggregated weekly
// Presence: Rank ≤ 25, Page 1: Rank ≤ 10
function generateTemporalData(preset: string) {
  const points = preset === "7d" ? 7 : preset === "30d" ? 15 : preset === "90d" ? 12 : 6;
  const baseDate = new Date();
  
  return Array.from({ length: points }, (_, i) => {
    const daysAgo = Math.floor((points - 1 - i) * (preset === "7d" ? 1 : preset === "30d" ? 2 : preset === "90d" ? 7.5 : 30));
    const date = new Date(baseDate);
    date.setDate(date.getDate() - daysAgo);
    
    // Simulate some null values for incomplete dates
    const hasCompleteData = Math.random() > 0.15;
    
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      // Page 1 Presence % (rank ≤ 10)
      page1Pct: hasCompleteData ? 52 + Math.random() * 12 + i * 0.4 : null,
      // SoS Presence % (rank ≤ 25)
      presencePct: hasCompleteData ? 72 + Math.random() * 8 + i * 0.3 : null,
      // Avg rank (only where presence exists)
      avgRank: hasCompleteData ? 8 - Math.random() * 2 - i * 0.15 : null,
    };
  });
}

function calculateVolatility(data: (number | null)[]): { trend: "stable" | "volatile" | "improving" } {
  const validData = data.filter((v): v is number => v !== null);
  if (validData.length < 2) return { trend: "stable" };
  
  const changes = validData.slice(1).map((val, i) => Math.abs(val - validData[i]));
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const lastChange = validData[validData.length - 1] - validData[0];
  
  if (avgChange > 4) return { trend: "volatile" };
  if (lastChange > 3) return { trend: "improving" };
  return { trend: "stable" };
}

export function SearchVisibilityTrendChart() {
  const { preset, getTimePhrase } = useDateRange();
  const rawData = generateTemporalData(preset);
  
  // Filter out dates with incomplete data
  const data = rawData.filter(d => 
    hasValidData(d.page1Pct) || hasValidData(d.presencePct)
  );
  
  const hasData = data.length >= 2;
  
  const page1Values = data.map(d => d.page1Pct);
  const validPage1 = page1Values.filter((v): v is number => v !== null);
  const volatility = calculateVolatility(page1Values);
  
  const trendChange = validPage1.length >= 2
    ? (validPage1[validPage1.length - 1] - validPage1[0]).toFixed(1)
    : null;
  const isPositive = trendChange !== null && Number(trendChange) >= 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Search Visibility Over Time</h3>
          <p className="text-sm text-muted-foreground">Presence % in Page 1 / Top 25 {getTimePhrase()}</p>
        </div>
        
        {/* Volatility Signal */}
        {hasData && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
            volatility.trend === "volatile" 
              ? "bg-status-warning/10 text-status-warning" 
              : volatility.trend === "improving"
              ? "bg-status-success/10 text-status-success"
              : "bg-muted text-muted-foreground"
          }`}>
            <Activity className="w-3.5 h-3.5" />
            <span>
              {volatility.trend === "volatile" && "Rank fluctuation detected"}
              {volatility.trend === "improving" && "Rankings improving"}
              {volatility.trend === "stable" && "Stable rankings"}
            </span>
          </div>
        )}
      </div>
      
      {hasData ? (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[40, 100]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 20]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => `#${value}`}
                  reversed
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                  formatter={(value: number | null, name: string) => {
                    if (value === null) return ["—", name];
                    if (name === "Avg Rank") return [`#${value.toFixed(1)}`, name];
                    return [`${value.toFixed(1)}%`, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                />
                {/* Limited to CHART_LIMITS.maxLines (3): 2 areas + 1 line */}
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="presencePct" 
                  name="SoS Presence %" 
                  fill="hsl(var(--primary) / 0.15)" 
                  stroke="hsl(var(--primary) / 0.4)"
                  strokeWidth={1}
                  connectNulls={false}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="page1Pct" 
                  name="Page 1 Presence %" 
                  fill="hsl(var(--primary) / 0.3)" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  connectNulls={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgRank" 
                  name="Avg Rank" 
                  stroke="hsl(var(--status-warning))" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Trend Summary */}
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
            {trendChange !== null ? (
              <div className={`flex items-center gap-1.5 text-sm font-medium ${isPositive ? "text-status-success" : "text-status-error"}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? "+" : ""}{trendChange}% Page 1 presence</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Insufficient data for trend</span>
            )}
            <span className="text-xs text-muted-foreground">{getTimePhrase()}</span>
          </div>
        </>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">{PLACEHOLDER_MESSAGES.insufficientData}</p>
        </div>
      )}
    </div>
  );
}
