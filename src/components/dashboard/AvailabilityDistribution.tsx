import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { IllustrativeLabel } from "./IllustrativeLabel";
import { CHART_LIMITS } from "@/lib/metrics";
import { useDateRange } from "@/contexts/DateRangeContext";

interface Band {
  band: string;
  count: number;
  color: string;
}

function generateDistributionData(): Band[] {
  return [
    { band: "≥95%", count: Math.round(30 + Math.random() * 20), color: "hsl(var(--status-success))" },
    { band: "90–94%", count: Math.round(20 + Math.random() * 15), color: "hsl(142, 71%, 65%)" },
    { band: "80–89%", count: Math.round(15 + Math.random() * 12), color: "hsl(var(--status-info))" },
    { band: "70–79%", count: Math.round(10 + Math.random() * 10), color: "hsl(var(--status-warning))" },
    { band: "50–69%", count: Math.round(5 + Math.random() * 8), color: "hsl(25, 95%, 53%)" },
    { band: "<50%", count: Math.round(2 + Math.random() * 6), color: "hsl(var(--status-danger))" },
  ].slice(0, CHART_LIMITS.maxBars);
}

export function AvailabilityDistribution() {
  const { getTimePhrase } = useDateRange();
  const data = generateDistributionData();
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6 relative">
      <IllustrativeLabel variant="corner" />
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-foreground">Availability Distribution</h4>
        <p className="text-xs text-muted-foreground">
          SKU count by availability band {getTimePhrase()} • {total} total SKUs
        </p>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="band"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
              }}
              formatter={(value: number) => [`${value} SKUs (${((value / total) * 100).toFixed(0)}%)`, "Count"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
