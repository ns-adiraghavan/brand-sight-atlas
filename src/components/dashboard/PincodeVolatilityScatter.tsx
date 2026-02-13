import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { IllustrativeLabel } from "./IllustrativeLabel";
import { CHART_LIMITS } from "@/lib/metrics";
import { useDateRange } from "@/contexts/DateRangeContext";

interface PincodePoint {
  name: string;
  pincode: string;
  availability: number;
  volatility: number;
}

function generateScatterData(): PincodePoint[] {
  const locations = [
    { name: "Mumbai - Fort", pincode: "400001" },
    { name: "Mumbai - Andheri", pincode: "400053" },
    { name: "Delhi - CP", pincode: "110001" },
    { name: "Bangalore - MG Road", pincode: "560001" },
    { name: "Hyderabad", pincode: "500001" },
    { name: "Chennai", pincode: "600001" },
    { name: "Pune - Camp", pincode: "411001" },
    { name: "Ahmedabad", pincode: "380001" },
    { name: "Kolkata", pincode: "700001" },
    { name: "Jaipur", pincode: "302001" },
  ];

  return locations.slice(0, CHART_LIMITS.maxRows).map((loc) => ({
    name: loc.name,
    pincode: loc.pincode,
    availability: Math.round(50 + Math.random() * 45),
    volatility: Math.round(5 + Math.random() * 40),
  }));
}

function getPointColor(availability: number, volatility: number): string {
  if (availability < 70 && volatility > 25) return "hsl(var(--status-danger))";
  if (availability < 80 || volatility > 20) return "hsl(var(--status-warning))";
  return "hsl(var(--status-success))";
}

export function PincodeVolatilityScatter() {
  const { getTimePhrase } = useDateRange();
  const data = generateScatterData();

  const highVolCount = data.filter((d) => d.volatility > 25).length;

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
            {highVolCount} high-volatility pincodes
          </span>
        )}
      </div>

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
              domain={[0, 50]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              label={{ value: "Volatility", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
              }}
              formatter={(value: number, name: string) => [
                name === "Availability" ? `${value}%` : value.toFixed(1),
                name,
              ]}
              labelFormatter={() => ""}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as PincodePoint;
                return (
                  <div className="bg-card border border-border rounded-lg p-2.5 text-xs shadow-md">
                    <p className="font-medium text-foreground">{d.name}</p>
                    <p className="text-muted-foreground">{d.pincode}</p>
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
    </div>
  );
}
