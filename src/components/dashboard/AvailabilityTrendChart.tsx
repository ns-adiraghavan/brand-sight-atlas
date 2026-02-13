import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDateRange } from "@/contexts/DateRangeContext";
import { Activity, AlertCircle } from "lucide-react";
import { IllustrativeLabel } from "./IllustrativeLabel";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyRow {
  week: string;
  platform: string;
  availability_pct: number | null;
  must_have_availability_pct: number | null;
}

interface ChartPoint {
  week: string;
  [key: string]: string | number | null;
}

const PLATFORM_COLORS: Record<string, string> = {
  dmart: "hsl(var(--primary))",
  jiomart: "hsl(var(--status-success))",
  amazon: "hsl(var(--status-info))",
  flipkart: "hsl(var(--status-warning))",
};

export function AvailabilityTrendChart() {
  const { getTimePhrase } = useDateRange();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("ola_weekly_trend")
      .select("week, platform, availability_pct, must_have_availability_pct")
      .order("week", { ascending: true })
      .then(({ data: rows }) => {
        if (rows && rows.length > 0) {
          const validRows = rows.filter((r) => r.week && r.platform) as WeeklyRow[];
          const platformSet = [...new Set(validRows.map((r) => r.platform))];
          setPlatforms(platformSet);

          // Pivot: one row per week with platform columns
          const weekMap = new Map<string, ChartPoint>();
          for (const row of validRows) {
            const weekLabel = new Date(row.week).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (!weekMap.has(row.week)) {
              weekMap.set(row.week, { week: weekLabel });
            }
            const point = weekMap.get(row.week)!;
            if (row.availability_pct != null) {
              point[row.platform] = +(row.availability_pct * 100).toFixed(1);
            }
            if (row.must_have_availability_pct != null) {
              point[`${row.platform}_mh`] = +(row.must_have_availability_pct * 100).toFixed(1);
            }
          }
          setData(Array.from(weekMap.values()));
        }
        setLoading(false);
      });
  }, []);

  const hasData = data.length >= 2;

  return (
    <div className="bg-card rounded-xl border border-border p-6 relative">
      <IllustrativeLabel variant="corner" />
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Availability Trend</h3>
          <p className="text-sm text-muted-foreground">Weekly availability % by platform {getTimePhrase()}</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
      ) : hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value}%`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              {platforms.map((p) => (
                <Line
                  key={p}
                  type="monotone"
                  dataKey={p}
                  name={`${p} (Overall)`}
                  stroke={PLATFORM_COLORS[p] || "hsl(var(--primary))"}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
              {platforms.map((p) => (
                <Line
                  key={`${p}_mh`}
                  type="monotone"
                  dataKey={`${p}_mh`}
                  name={`${p} (Must-Have)`}
                  stroke={PLATFORM_COLORS[p] || "hsl(var(--primary))"}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">Insufficient trend data</p>
        </div>
      )}
    </div>
  );
}
