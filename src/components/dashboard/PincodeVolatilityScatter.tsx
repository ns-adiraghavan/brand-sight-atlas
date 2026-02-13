import { useEffect, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { IllustrativeLabel } from "./IllustrativeLabel";
import { useDateRange } from "@/contexts/DateRangeContext";
import { supabase } from "@/integrations/supabase/client";

interface PincodePoint {
  location: string;
  platform: string;
  availability: number;
  volatility: number;
}

function getPointColor(availability: number, volatility: number): string {
  if (availability < 70 && volatility > 5) return "hsl(var(--status-danger))";
  if (availability < 80 || volatility > 4) return "hsl(var(--status-warning))";
  return "hsl(var(--status-success))";
}

export function PincodeVolatilityScatter() {
  const { getTimePhrase } = useDateRange();
  const [data, setData] = useState<PincodePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("ola_pincode_volatility_mat")
      .select("location, platform, avg_availability, volatility_index")
      .then(({ data: rows }) => {
        if (rows && rows.length > 0) {
          setData(
            rows
              .filter((r) => r.location && r.avg_availability != null && r.volatility_index != null)
              .map((r) => ({
                location: r.location!,
                platform: r.platform || "",
                availability: +(Number(r.avg_availability) * 100).toFixed(1),
                volatility: +(Number(r.volatility_index) * 100).toFixed(1),
              }))
          );
        }
        setLoading(false);
      });
  }, []);

  const highVolCount = data.filter((d) => d.volatility > 5).length;

  return (
    <div className="bg-card rounded-xl border border-border p-6 relative">
      <IllustrativeLabel variant="corner" />
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Pincode Volatility</h4>
          <p className="text-xs text-muted-foreground">
            Availability % vs volatility index {getTimePhrase()}
          </p>
        </div>
        {highVolCount > 0 && (
          <span className="text-[11px] px-2 py-1 rounded-md bg-status-warning/10 text-status-warning font-medium">
            {highVolCount} high-volatility locations
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  dataKey="availability"
                  name="Availability"
                  domain={[40, 100]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: "Availability %", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  type="number"
                  dataKey="volatility"
                  name="Volatility"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "Volatility", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as PincodePoint;
                    return (
                      <div className="bg-card border border-border rounded-lg p-2.5 text-xs shadow-md">
                        <p className="font-medium text-foreground">{d.location}</p>
                        <p className="text-muted-foreground capitalize">{d.platform}</p>
                        <p className="mt-1">Availability: <span className="font-medium">{d.availability}%</span></p>
                        <p>Volatility: <span className="font-medium">{d.volatility}</span></p>
                      </div>
                    );
                  }}
                />
                <Scatter data={data} fill="hsl(var(--primary))">
                  {data.map((entry, i) => (
                    <Cell key={i} fill={getPointColor(entry.availability, entry.volatility)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            {[
              { label: "Healthy", color: "bg-status-success" },
              { label: "Watch", color: "bg-status-warning" },
              { label: "At Risk", color: "bg-status-error" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
