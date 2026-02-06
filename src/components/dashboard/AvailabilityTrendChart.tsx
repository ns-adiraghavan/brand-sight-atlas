import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDateRange } from "@/contexts/DateRangeContext";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";
import { CHART_LIMITS, hasValidData, PLACEHOLDER_MESSAGES } from "@/lib/metrics";
import { IllustrativeLabel } from "./IllustrativeLabel";

// Generate mock temporal data based on date range
// Grain: SKU × Pincode × Day, aggregated weekly
function generateTemporalData(preset: string) {
  const points = preset === "7d" ? 7 : preset === "30d" ? 15 : preset === "90d" ? 12 : 6;
  const baseDate = new Date();
  
  return Array.from({ length: points }, (_, i) => {
    const daysAgo = Math.floor((points - 1 - i) * (preset === "7d" ? 1 : preset === "30d" ? 2 : preset === "90d" ? 7.5 : 30));
    const date = new Date(baseDate);
    date.setDate(date.getDate() - daysAgo);
    
    // Simulate some null values for incomplete dates (15% chance)
    const hasCompleteData = Math.random() > 0.15;
    
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      overall: hasCompleteData ? 82 + Math.random() * 10 + i * 0.3 : null,
      topPacks: hasCompleteData ? 88 + Math.random() * 8 + i * 0.2 : null,
      mustHave: hasCompleteData ? 78 + Math.random() * 12 + i * 0.25 : null,
    };
  });
}

function calculateVolatility(data: (number | null)[]): { score: number; trend: "stable" | "volatile" | "improving" } {
  const validData = data.filter((v): v is number => v !== null);
  if (validData.length < 2) return { score: 0, trend: "stable" };
  
  const changes = validData.slice(1).map((val, i) => Math.abs(val - validData[i]));
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const lastChange = validData[validData.length - 1] - validData[0];
  
  if (avgChange > 3) return { score: avgChange, trend: "volatile" };
  if (lastChange > 2) return { score: avgChange, trend: "improving" };
  return { score: avgChange, trend: "stable" };
}

export function AvailabilityTrendChart() {
  const { preset, getTimePhrase } = useDateRange();
  const rawData = generateTemporalData(preset);
  
  // Filter out dates with incomplete data (all nulls)
  const data = rawData.filter(d => 
    hasValidData(d.overall) || hasValidData(d.topPacks) || hasValidData(d.mustHave)
  );
  
  // Check if we have enough data
  const hasData = data.length >= 2;
  
  const overallValues = data.map(d => d.overall);
  const validOverall = overallValues.filter((v): v is number => v !== null);
  const volatility = calculateVolatility(overallValues);
  
  const trendChange = validOverall.length >= 2 
    ? (validOverall[validOverall.length - 1] - validOverall[0]).toFixed(1)
    : null;
  const isPositive = trendChange !== null && Number(trendChange) >= 0;

  // Lines limited to CHART_LIMITS.maxLines (3)
  const lineConfigs = [
    { key: "overall", name: "Overall", color: "hsl(var(--primary))", width: 2.5 },
    { key: "topPacks", name: "Top Packs", color: "hsl(var(--status-success))", width: 2 },
    { key: "mustHave", name: "Must-Have", color: "hsl(var(--status-warning))", width: 2 },
  ].slice(0, CHART_LIMITS.maxLines);

  return (
    <div className="bg-card rounded-xl border border-border p-6 relative">
      <IllustrativeLabel variant="corner" />
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Availability Trend</h3>
          <p className="text-sm text-muted-foreground">SKU availability % {getTimePhrase()}</p>
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
              {volatility.trend === "volatile" && "High volatility detected"}
              {volatility.trend === "improving" && "Steady improvement"}
              {volatility.trend === "stable" && "Stable pattern"}
            </span>
          </div>
        )}
      </div>
      
      {hasData ? (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  domain={[70, 100]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                  formatter={(value: number | null) => value !== null ? [`${value.toFixed(1)}%`, ""] : ["—", ""]}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                />
                {lineConfigs.map((line) => (
                  <Line 
                    key={line.key}
                    type="monotone" 
                    dataKey={line.key} 
                    name={line.name} 
                    stroke={line.color} 
                    strokeWidth={line.width}
                    dot={false}
                    activeDot={{ r: 4, fill: line.color }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Trend Summary */}
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
            {trendChange !== null ? (
              <div className={`flex items-center gap-1.5 text-sm font-medium ${isPositive ? "text-status-success" : "text-status-error"}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? "+" : ""}{trendChange}% change</span>
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
