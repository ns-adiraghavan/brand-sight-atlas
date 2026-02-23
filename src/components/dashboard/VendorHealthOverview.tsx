import { useEffect, useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { MetricTooltip } from "./MetricTooltip";
import { supabase } from "@/integrations/supabase/client";
import { useDateRange } from "@/contexts/DateRangeContext";
import { aggregateByPlatform } from "@/lib/aggregation";

interface OlaVendorRow {
  platform: string;
  skus_tracked: number | null;
  availability_pct: number | null;
  must_have_availability_pct: number | null;
  sku_reliability_pct: number | null;
}

interface SosVendorRow {
  platform: string;
  keywords_tracked: number | null;
  top10_presence_pct: number | null;
  elite_rank_share_pct: number | null;
  organic_share_pct: number | null;
  avg_rank_volatility: number | null;
}

type MetricDef = {
  label: string;
  tooltip: string;
  getValue: (row: any) => number | null;
  format: (v: number) => string;
  higherIsBetter: boolean;
};

const OLA_METRICS: MetricDef[] = [
  {
    label: "SKUs Tracked",
    tooltip: "Total number of unique SKUs being monitored for availability across all pincodes on this platform.",
    getValue: (r: OlaVendorRow) => r.skus_tracked,
    format: (v) => v.toLocaleString(),
    higherIsBetter: true,
  },
  {
    label: "Availability %",
    tooltip: "Percentage of tracked SKU-pincode-day observations where the product was in stock.",
    getValue: (r: OlaVendorRow) => r.availability_pct,
    format: (v) => `${(v * 100).toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    label: "Must-Have Avail %",
    tooltip: "Availability percentage for priority SKUs flagged as must-have. Target: ≥90%.",
    getValue: (r: OlaVendorRow) => r.must_have_availability_pct,
    format: (v) => `${(v * 100).toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    label: "SKU Reliability %",
    tooltip: "% of SKUs maintaining ≥80% availability across a 90-day window. Measures long-term stock consistency.",
    getValue: (r: OlaVendorRow) => r.sku_reliability_pct,
    format: (v) => `${(v * 100).toFixed(1)}%`,
    higherIsBetter: true,
  },
];

const SOS_METRICS: MetricDef[] = [
  {
    label: "Keywords Tracked",
    tooltip: "Total unique search keywords being monitored for ranking and visibility on this platform.",
    getValue: (r: SosVendorRow) => r.keywords_tracked,
    format: (v) => v.toLocaleString(),
    higherIsBetter: true,
  },
  {
    label: "Top10 Presence %",
    tooltip: "Percentage of keyword-day observations where at least one HUL product appeared in the top 10 results.",
    getValue: (r: SosVendorRow) => r.top10_presence_pct,
    format: (v) => `${(v * 100).toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    label: "Elite Share %",
    tooltip: "% of Top 10 listings that rank within positions 1–3. Measures premium positioning strength.",
    getValue: (r: SosVendorRow) => r.elite_rank_share_pct,
    format: (v) => `${(v * 100).toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    label: "Organic Share %",
    tooltip: "Share of organic (non-sponsored) listings in top search results attributed to HUL products.",
    getValue: (r: SosVendorRow) => r.organic_share_pct,
    format: (v) => `${(v * 100).toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    label: "Rank Volatility",
    tooltip: "Average standard deviation of daily search rank across tracked keywords. Lower values indicate more stable positioning.",
    getValue: (r: SosVendorRow) => r.avg_rank_volatility,
    format: (v) => v.toFixed(2),
    higherIsBetter: false,
  },
];

interface VendorHealthOverviewProps {
  variant: "ola" | "sos";
}

export function VendorHealthOverview({ variant }: VendorHealthOverviewProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { dateRange } = useDateRange();

  const metrics = variant === "ola" ? OLA_METRICS : SOS_METRICS;
  const viewName = variant === "ola" ? "ola_vendor_health_mat" : "sos_vendor_health_mat";
  const numericKeys = variant === "ola"
    ? ["skus_tracked", "availability_pct", "must_have_availability_pct", "sku_reliability_pct"]
    : ["keywords_tracked", "top10_presence_pct", "elite_rank_share_pct", "organic_share_pct", "avg_rank_volatility"];

  useEffect(() => {
    supabase
      .from(viewName)
      .select("*")
      .gte("week", dateRange.from.toISOString())
      .lte("week", dateRange.to.toISOString())
      .then(({ data }) => {
        if (data) {
          const filtered = data.filter((r: any) => r.platform);
          const aggregated = aggregateByPlatform(filtered, numericKeys);
          setRows(aggregated);
        }
        setLoading(false);
      });
  }, [viewName, dateRange.from.getTime(), dateRange.to.getTime()]);

  const platforms = rows.map((r: any) => r.platform as string);

  // Compute gap between platforms for each metric (only when 2 platforms)
  const computeGap = (metric: MetricDef): { value: number; color: string } | null => {
    if (platforms.length !== 2) return null;
    const v0 = metric.getValue(rows[0]);
    const v1 = metric.getValue(rows[1]);
    if (v0 == null || v1 == null) return null;
    const gap = Math.abs(v0 - v1);
    // Color: green if gap is small, amber if moderate, red if large
    const isPercentage = metric.format(0.5).includes("%");
    const threshold = isPercentage ? 0.05 : (metric.label === "Rank Volatility" ? 2 : 50);
    const color = gap <= threshold * 0.5
      ? "text-status-success"
      : gap <= threshold
        ? "text-status-warning"
        : "text-status-danger";
    return { value: gap, color };
  };

  return (
    <section>
      <SectionHeader
        title="Vendor Health Overview"
        subtitle="Cross-platform tracking coverage and headline performance"
      />

      <div className="bg-card rounded-xl border border-border p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No vendor data available</p>
        ) : (
          <>
            {/* Header row */}
            <div className="grid gap-3" style={{ gridTemplateColumns: `140px repeat(${platforms.length}, 1fr)${platforms.length === 2 ? " 100px" : ""}` }}>
              <div /> {/* spacer */}
              {platforms.map((p) => (
                <p key={p} className="text-xs text-muted-foreground uppercase tracking-wide font-medium text-center capitalize">{p}</p>
              ))}
              {platforms.length === 2 && (
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium text-center">Gap</p>
              )}
            </div>

            {/* Metric rows */}
            <div className="mt-2 space-y-1">
              {metrics.map((metric) => {
                const gap = computeGap(metric);
                return (
                  <div
                    key={metric.label}
                    className="grid gap-3 items-center py-2.5 border-b border-border/30 last:border-b-0"
                    style={{ gridTemplateColumns: `140px repeat(${platforms.length}, 1fr)${platforms.length === 2 ? " 100px" : ""}` }}
                  >
                    {/* Metric label + tooltip */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">{metric.label}</span>
                      <MetricTooltip definition={metric.tooltip} />
                    </div>

                    {/* Per-platform values */}
                    {rows.map((row: any) => {
                      const val = metric.getValue(row);
                      return (
                        <p key={row.platform} className="text-lg font-bold text-foreground text-center">
                          {val != null ? metric.format(val) : "—"}
                        </p>
                      );
                    })}

                    {/* Gap column */}
                    {platforms.length === 2 && (
                      <p className={`text-sm font-semibold text-center ${gap?.color ?? "text-muted-foreground"}`}>
                        {gap != null ? (
                          metric.label.includes("Tracked")
                            ? gap.value.toLocaleString()
                            : metric.label.includes("Volatility")
                              ? gap.value.toFixed(2)
                              : `${(gap.value * 100).toFixed(1)}pp`
                        ) : "—"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground italic mt-3">
              Vendor comparisons normalized by tracked SKU/keyword coverage.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
