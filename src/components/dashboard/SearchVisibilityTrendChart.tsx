import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { useDateRange } from "@/contexts/DateRangeContext";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

// Generate mock temporal data based on date range
function generateTemporalData(preset: string) {
  const points = preset === "7d" ? 7 : preset === "30d" ? 15 : preset === "90d" ? 12 : 6;
  const baseDate = new Date();
  
  return Array.from({ length: points }, (_, i) => {
    const daysAgo = Math.floor((points - 1 - i) * (preset === "7d" ? 1 : preset === "30d" ? 2 : preset === "90d" ? 7.5 : 30));
    const date = new Date(baseDate);
    date.setDate(date.getDate() - daysAgo);
    
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      top10Pct: 52 + Math.random() * 12 + i * 0.4,
      top25Pct: 72 + Math.random() * 8 + i * 0.3,
      avgRank: 8 - Math.random() * 2 - i * 0.15,
    };
  });
}

function calculateVolatility(data: number[]): { trend: "stable" | "volatile" | "improving" } {
  if (data.length < 2) return { trend: "stable" };
  
  const changes = data.slice(1).map((val, i) => Math.abs(val - data[i]));
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const lastChange = data[data.length - 1] - data[0];
  
  if (avgChange > 4) return { trend: "volatile" };
  if (lastChange > 3) return { trend: "improving" };
  return { trend: "stable" };
}

export function SearchVisibilityTrendChart() {
  const { preset, getTimePhrase } = useDateRange();
  const data = generateTemporalData(preset);
  
  const top10Values = data.map(d => d.top10Pct);
  const volatility = calculateVolatility(top10Values);
  const trendChange = (top10Values[top10Values.length - 1] - top10Values[0]).toFixed(1);
  const isPositive = Number(trendChange) >= 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Search Visibility Over Time</h3>
          <p className="text-sm text-muted-foreground">% of keywords with presence in Top 10/25 {getTimePhrase()}</p>
        </div>
        
        {/* Volatility Signal */}
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
      </div>
      
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
              formatter={(value: number, name: string) => {
                if (name === "Avg Rank") return [`#${value.toFixed(1)}`, name];
                return [`${value.toFixed(1)}%`, name];
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="top25Pct" 
              name="In Top 25" 
              fill="hsl(var(--primary) / 0.15)" 
              stroke="hsl(var(--primary) / 0.4)"
              strokeWidth={1}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="top10Pct" 
              name="In Top 10" 
              fill="hsl(var(--primary) / 0.3)" 
              stroke="hsl(var(--primary))"
              strokeWidth={2}
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
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Trend Summary */}
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
        <div className={`flex items-center gap-1.5 text-sm font-medium ${isPositive ? "text-status-success" : "text-status-error"}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{isPositive ? "+" : ""}{trendChange}% Top 10 visibility</span>
        </div>
        <span className="text-xs text-muted-foreground">{getTimePhrase()}</span>
      </div>
    </div>
  );
}
