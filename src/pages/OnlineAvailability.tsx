import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AvailabilityTrendChart } from "@/components/dashboard/AvailabilityTrendChart";
import { PincodeVolatilityScatter } from "@/components/dashboard/PincodeVolatilityScatter";
import { ExecutionDiagnostics } from "@/components/dashboard/ExecutionDiagnostics";
import { AvailabilityDistribution } from "@/components/dashboard/AvailabilityDistribution";
import { DataStatusIndicator, useDataStatus } from "@/components/dashboard/DataStatusIndicator";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { AlertTriangle, Shield } from "lucide-react";
import { useDateRange } from "@/contexts/DateRangeContext";
import { AlignmentInsight } from "@/components/dashboard/AlignmentInsight";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { VendorHealthOverview } from "@/components/dashboard/VendorHealthOverview";
import { KeyTakeaways } from "@/components/dashboard/KeyTakeaways";
import { supabase } from "@/integrations/supabase/client";
import { aggregateOlaHealth, type OlaHealthAggregated } from "@/lib/aggregation";

export default function OnlineAvailability() {
  const { preset, getTimePhrase, dateRange } = useDateRange();
  const dataStatus = useDataStatus(preset);

  const [execData, setExecData] = useState<OlaHealthAggregated[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("ola_vendor_health_mat")
      .select("platform, available_skus, total_skus, must_have_available_skus, must_have_skus, week")
      .gte("week", dateRange.from.toISOString())
      .lte("week", dateRange.to.toISOString())
      .then(({ data: rows }) => {
        if (rows) {
          const filtered = rows.filter((r) => r.platform && r.total_skus != null);
          setExecData(aggregateOlaHealth(filtered as any));
        }
        setLoading(false);
      });
  }, [dateRange.from.getTime(), dateRange.to.getTime()]);

  // Aggregate across platforms (weighted: sum all counts then divide)
  const totalAvailAll = execData.reduce((s, d) => s + (d.availability_pct != null ? d.availability_pct * d.skus_tracked : 0), 0);
  const totalSkusAll = execData.reduce((s, d) => s + d.skus_tracked, 0);
  const avgAvailability = totalSkusAll > 0 ? totalAvailAll / totalSkusAll : null;

  const totalMHAll = execData.reduce((s, d) => s + (d.must_have_availability_pct != null ? d.must_have_availability_pct * d.skus_tracked : 0), 0);
  const avgMustHave = totalSkusAll > 0 ? totalMHAll / totalSkusAll : null;

  // sku_reliability_pct not available from count columns — omit
  const avgReliability: number | null = null;

  const MUST_HAVE_TARGET = 0.9;
  const mustHaveDeltaPP = avgMustHave != null ? ((avgMustHave - MUST_HAVE_TARGET) * 100) : null;

  const getPerformanceBand = (pct: number | null) => {
    if (pct == null) return { label: "—", color: "text-muted-foreground", bg: "bg-muted/30", icon: null };
    const v = pct * 100;
    if (v >= 90) return { label: "Strong", color: "text-status-success", bg: "bg-status-success/10", icon: null };
    if (v >= 75) return { label: "Watch", color: "text-status-warning", bg: "bg-status-warning/10", icon: null };
    return { label: "Critical", color: "text-status-danger", bg: "bg-status-danger/10", icon: <AlertTriangle className="w-4 h-4" /> };
  };

  const availBand = getPerformanceBand(avgAvailability);
  const mustHaveBand = getPerformanceBand(avgMustHave);
  const reliabilityBand = getPerformanceBand(avgReliability);

  // Build structured 4-part insight
  const platformsSorted = [...execData].sort((a, b) => (b.availability_pct ?? 0) - (a.availability_pct ?? 0));
  const topPlatform = platformsSorted[0];
  const bottomPlatform = platformsSorted[platformsSorted.length - 1];
  const vendorGapPP = topPlatform && bottomPlatform
    ? ((topPlatform.availability_pct - bottomPlatform.availability_pct) * 100).toFixed(1)
    : null;

  const insightLines: string[] = [];

  // 1. Metric change
  if (avgAvailability != null) {
    insightLines.push(
      `Availability stands at ${(avgAvailability * 100).toFixed(1)}% over the last 30 days.`
    );
  }

  // 2. Vendor comparison
  if (vendorGapPP && topPlatform && bottomPlatform && Number(vendorGapPP) > 0) {
    insightLines.push(
      `${bottomPlatform.platform.charAt(0).toUpperCase() + bottomPlatform.platform.slice(1)} trails ${topPlatform.platform.charAt(0).toUpperCase() + topPlatform.platform.slice(1)} by ${vendorGapPP}pp.`
    );
  }

  // 3. Interpretation
  if (vendorGapPP && Number(vendorGapPP) > 2) {
    insightLines.push(
      "This gap suggests platform-specific listing or replenishment issues."
    );
  } else if (mustHaveDeltaPP != null && mustHaveDeltaPP < 0) {
    insightLines.push(
      `Must-have products miss the 90% target by ${Math.abs(mustHaveDeltaPP).toFixed(1)}pp, indicating frequent out-of-stock days.`
    );
  }

  // 4. Action
  if (bottomPlatform) {
    insightLines.push(
      `Prioritize must-have SKUs with availability below 70% on ${bottomPlatform.platform.charAt(0).toUpperCase() + bottomPlatform.platform.slice(1)}.`
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">

        {/* ===== KEY TAKEAWAYS ===== */}
        <KeyTakeaways variant="ola" />

        {/* ===== SECTION 0: VENDOR HEALTH ===== */}
        <VendorHealthOverview variant="ola" />

        {/* ===== SECTION 1: EXECUTIVE SNAPSHOT ===== */}
        <section>
          <SectionHeader
            title="Executive Snapshot"
            subtitle="Key availability metrics at a glance"
            action={<DataStatusIndicator status={dataStatus} />}
          />

          {/* Insight paragraph — 30% shorter */}
          {insightLines.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 mb-5 space-y-1">
              {insightLines.map((line, i) => (
                <p key={i} className="text-xs text-foreground leading-snug">{line}</p>
              ))}
            </div>
          )}

          {/* KPI row from ola_exec_summary */}
          <div className="bg-card rounded-xl border border-border p-6">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {/* Overall Availability — PRIMARY (largest) */}
                <div className={`text-center border-r border-border pr-6 rounded-lg py-3 ${availBand.bg}`}>
                  <p className="text-5xl font-extrabold tracking-tight text-foreground">
                    {avgAvailability != null ? `${(avgAvailability * 100).toFixed(1)}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Overall Availability</p>
                  <span className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold ${availBand.color}`}>
                    {availBand.icon}{availBand.label}
                  </span>
                </div>

                {/* Must-Have Availability — SECONDARY + delta */}
                <div className={`flex flex-col justify-center rounded-lg p-3 ${mustHaveBand.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {mustHaveBand.icon || <AlertTriangle className={`w-4 h-4 ${mustHaveBand.color}`} />}
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Must-Have Avail</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {avgMustHave != null ? `${(avgMustHave * 100).toFixed(1)}%` : "—"}
                  </p>
                  {mustHaveDeltaPP != null && (
                    <span className={`text-xs font-semibold mt-1 ${mustHaveDeltaPP >= 0 ? "text-status-success" : "text-status-danger"}`}>
                      {mustHaveDeltaPP >= 0 ? "+" : ""}{mustHaveDeltaPP.toFixed(1)}pp vs 90% target
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold ${mustHaveBand.color}`}>
                    {mustHaveBand.label}
                  </span>
                </div>

                {/* SKU Reliability — SECONDARY + Critical highlight */}
                <div className={`flex flex-col justify-center rounded-lg p-3 ${reliabilityBand.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {reliabilityBand.icon || <Shield className={`w-4 h-4 ${reliabilityBand.color}`} />}
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">SKU Reliability</span>
                    <MetricTooltip definition="% of SKUs maintaining ≥80% availability across a 90-day window." />
                  </div>
                  <p className={`text-3xl font-bold ${reliabilityBand.color}`}>
                    {avgReliability != null ? `${(avgReliability * 100).toFixed(1)}%` : "—"}
                  </p>
                  <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold ${reliabilityBand.color}`}>
                    {reliabilityBand.label}
                  </span>
                </div>

                {/* Per-platform breakdown */}
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">By Platform</span>
                  <div className="space-y-1.5">
                    {execData.map((p) => {
                      const band = getPerformanceBand(p.availability_pct);
                      return (
                        <div key={p.platform} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{p.platform}</span>
                          <span className={`font-semibold ${band.color}`}>
                            {(p.availability_pct * 100).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== SECTION 2: STRUCTURAL TRENDS ===== */}
        <section>
          <SectionHeader
            title="Structural Trends"
            subtitle="Temporal patterns and platform comparison"
          />
          <AvailabilityTrendChart />
        </section>

        {/* ===== SECTION 3: EXECUTION DIAGNOSTICS ===== */}
        <ExecutionDiagnostics variant="ola" />

        {/* ===== SECTION 3b: OPERATIONAL DEEP DIVE ===== */}
        <section>
          <SectionHeader
            title="Operational Deep Dive"
            subtitle="Location and distribution diagnostics"
          />
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3">
              <PincodeVolatilityScatter />
            </div>
            <div className="col-span-2">
              <AvailabilityDistribution />
            </div>
          </div>
        </section>

        {/* ===== SECTION 4: ALIGNMENT ===== */}
        <section>
          <AlignmentInsight />
        </section>
      </div>
    </DashboardLayout>
  );
}
