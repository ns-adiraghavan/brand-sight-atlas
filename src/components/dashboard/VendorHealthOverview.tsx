import { useEffect, useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { MetricTooltip } from "./MetricTooltip";
import { supabase } from "@/integrations/supabase/client";

interface OlaVendorRow {
  platform: string;
  skus_tracked: number;
  availability_pct: number | null;
  must_have_availability_pct: number | null;
  sku_reliability_pct: number | null;
}

interface SosVendorRow {
  platform: string;
  keywords_tracked: number;
  top10_presence_pct: number | null;
  elite_rank_share_pct: number | null;
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
];

interface VendorHealthOverviewProps {
  variant: "ola" | "sos";
}

export function VendorHealthOverview({ variant }: VendorHealthOverviewProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const metrics = variant === "ola" ? OLA_METRICS : SOS_METRICS;

  useEffect(() => {
    if (variant === "ola") {
      supabase
        .from("vendor_health_overview_mat")
        .select("platform, skus_tracked, availability_pct")
        .then(({ data }) => {
          if (data) setRows(data.filter((r: any) => r.platform).map((r: any) => ({
            ...r,
            must_have_availability_pct: null,
            sku_reliability_pct: null,
          })));
          setLoading(false);
        });
    } else {
      supabase
        .from("vendor_search_overview_mat")
        .select("platform, keywords_tracked, top10_presence_pct")
        .then(({ data }) => {
          if (data) setRows(data.filter((r: any) => r.platform).map((r: any) => ({
            ...r,
            elite_rank_share_pct: null,
          })));
          setLoading(false);
        });
    }
  }, [variant]);

  const platforms = rows.map((r: any) => r.platform as string);

  const computeGap = (metric: MetricDef): { value: number; color: string } | null => {
    if (platforms.length !== 2) return null;
    const v0 = metric.getValue(rows[0]);
    const v1 = metric.getValue(rows[1]);
    if (v0 == null || v1 == null) return null;
    const gap = Math.abs(v0 - v1);
    const isPercentage = metric.format(0.5).includes("%");
    const threshold = isPercentage ? 0.05 : 50;
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
            <div className="grid gap-3" style={{ gridTemplateColumns: `140px repeat(${platforms.length}, 1fr)${platforms.length === 2 ? " 100px" : ""}` }}>
              <div />
              {platforms.map((p) => (
                <p key={p} className="text-xs text-muted-foreground uppercase tracking-wide font-medium text-center capitalize">{p}</p>
              ))}
              {platforms.length === 2 && (
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium text-center">Gap</p>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {metrics.map((metric) => {
                const gap = computeGap(metric);
                return (
                  <div
                    key={metric.label}
                    className="grid gap-3 items-center py-2.5 border-b border-border/30 last:border-b-0"
                    style={{ gridTemplateColumns: `140px repeat(${platforms.length}, 1fr)${platforms.length === 2 ? " 100px" : ""}` }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">{metric.label}</span>
                      <MetricTooltip definition={metric.tooltip} />
                    </div>
                    {rows.map((row: any) => {
                      const val = metric.getValue(row);
                      return (
                        <p key={row.platform} className="text-lg font-bold text-foreground text-center">
                          {val != null ? metric.format(val) : "—"}
                        </p>
                      );
                    })}
                    {platforms.length === 2 && (
                      <p className={`text-sm font-semibold text-center ${gap?.color ?? "text-muted-foreground"}`}>
                        {gap != null ? (
                          metric.label.includes("Tracked")
                            ? gap.value.toLocaleString()
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
