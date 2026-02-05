import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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
      overall: 82 + Math.random() * 10 + i * 0.3,
      topPacks: 88 + Math.random() * 8 + i * 0.2,
      mustHave: 78 + Math.random() * 12 + i * 0.25,
    };
  });
}

function calculateVolatility(data: number[]): { score: number; trend: "stable" | "volatile" | "improving" } {
  if (data.length < 2) return { score: 0, trend: "stable" };
  
  const changes = data.slice(1).map((val, i) => Math.abs(val - data[i]));
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const lastChange = data[data.length - 1] - data[0];
  
  if (avgChange > 3) return { score: avgChange, trend: "volatile" };
  if (lastChange > 2) return { score: avgChange, trend: "improving" };
  return { score: avgChange, trend: "stable" };
}

export function AvailabilityTrendChart() {
  const { preset, getTimePhrase } = useDateRange();
  const data = generateTemporalData(preset);
  
  const overallValues = data.map(d => d.overall);
  const volatility = calculateVolatility(overallValues);
  const trendChange = (overallValues[overallValues.length - 1] - overallValues[0]).toFixed(1);
  const isPositive = Number(trendChange) >= 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Availability Trend</h3>
          <p className="text-sm text-muted-foreground">SKU availability % {getTimePhrase()}</p>
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
            {volatility.trend === "volatile" && "High volatility detected"}
            {volatility.trend === "improving" && "Steady improvement"}
            {volatility.trend === "stable" && "Stable pattern"}
          </span>
        </div>
      </div>
      
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
              formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Line 
              type="monotone" 
              dataKey="overall" 
              name="Overall" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
            />
            <Line 
              type="monotone" 
              dataKey="topPacks" 
              name="Top Packs" 
              stroke="hsl(var(--status-success))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--status-success))" }}
            />
            <Line 
              type="monotone" 
              dataKey="mustHave" 
              name="Must-Have" 
              stroke="hsl(var(--status-warning))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--status-warning))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Trend Summary */}
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
        <div className={`flex items-center gap-1.5 text-sm font-medium ${isPositive ? "text-status-success" : "text-status-error"}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{isPositive ? "+" : ""}{trendChange}% change</span>
        </div>
        <span className="text-xs text-muted-foreground">{getTimePhrase()}</span>
      </div>
    </div>
  );
}
