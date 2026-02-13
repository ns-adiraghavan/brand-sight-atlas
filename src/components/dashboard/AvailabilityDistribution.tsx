import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { IllustrativeLabel } from "./IllustrativeLabel";
import { useDateRange } from "@/contexts/DateRangeContext";
import { supabase } from "@/integrations/supabase/client";

interface Band {
  band: string;
  count: number;
  color: string;
}

const BAND_COLORS: Record<string, string> = {
  "85–100%": "hsl(var(--status-success))",
  "70–85%": "hsl(var(--status-info))",
  "50–70%": "hsl(var(--status-warning))",
  "0–50%": "hsl(var(--status-danger))",
};

const BAND_ORDER = ["85–100%", "70–85%", "50–70%", "0–50%"];

export function AvailabilityDistribution() {
  const { getTimePhrase } = useDateRange();
  const [data, setData] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("ola_availability_distribution")
      .select("availability_band, platform, sku_count")
      .then(({ data: rows }) => {
        if (rows && rows.length > 0) {
          // Aggregate across platforms
          const bandMap = new Map<string, number>();
          for (const row of rows) {
            if (row.availability_band && row.sku_count != null) {
              bandMap.set(
                row.availability_band,
                (bandMap.get(row.availability_band) || 0) + Number(row.sku_count)
              );
            }
          }
          const bands: Band[] = BAND_ORDER
            .filter((b) => bandMap.has(b))
            .map((b) => ({
              band: b,
              count: bandMap.get(b)!,
              color: BAND_COLORS[b] || "hsl(var(--muted-foreground))",
            }));
          setData(bands);
        }
        setLoading(false);
      });
  }, []);

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

      {loading ? (
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
      ) : (
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
                formatter={(value: number) => [
                  `${value} SKUs (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`,
                  "Count",
                ]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
