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
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { supabase } from "@/integrations/supabase/client";

interface ExecRow {
  platform: string;
  availability_pct: number | null;
  must_have_availability_pct: number | null;
  sku_reliability_pct: number | null;
}

export default function OnlineAvailability() {
  const { preset } = useDateRange();
  const dataStatus = useDataStatus(preset);

  const [execData, setExecData] = useState<ExecRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the latest week from ola_exec_summary_mat
    supabase
      .from("ola_exec_summary_mat")
      .select("week")
      .order("week", { ascending: false })
      .limit(1)
      .then(({ data: weekRows }) => {
        const latestWeek = weekRows?.[0]?.week;
        if (!latestWeek) { setLoading(false); return; }
        supabase
          .from("ola_exec_summary_mat")
          .select("platform, availability_pct, must_have_availability_pct")
          .eq("week", latestWeek)
          .then(({ data: rows }) => {
            if (rows) {
              setExecData(rows.filter((r) => r.platform).map(r => ({
                ...r,
                platform: r.platform!,
                availability_pct: r.availability_pct != null ? Number(r.availability_pct) : null,
                must_have_availability_pct: r.must_have_availability_pct != null ? Number(r.must_have_availability_pct) : null,
                sku_reliability_pct: null,
              })) as ExecRow[]);
            }
            setLoading(false);
          });
      });
  }, []);

  // Simple average across platforms for headline KPIs
  const avgAvailability = execData.length > 0
    ? execData.reduce((s, d) => s + (d.availability_pct ?? 0), 0) / execData.length
    : null;
  const avgMustHave = execData.length > 0
    ? execData.reduce((s, d) => s + (d.must_have_availability_pct ?? 0), 0) / execData.length
    : null;
  const avgReliability = execData.length > 0
    ? execData.reduce((s, d) => s + (d.sku_reliability_pct ?? 0), 0) / execData.length
    : null;

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

  // Build structured insight
  const platformsSorted = [...execData].sort((a, b) => (b.availability_pct ?? 0) - (a.availability_pct ?? 0));
  const topPlatform = platformsSorted[0];
  const bottomPlatform = platformsSorted[platformsSorted.length - 1];
  const vendorGapPP = topPlatform && bottomPlatform
    ? (((topPlatform.availability_pct ?? 0) - (bottomPlatform.availability_pct ?? 0)) * 100).toFixed(1)
    : null;

  const insightLines: string[] = [];
  if (avgAvailability != null) {
    insightLines.push(`Availability stands at ${(avgAvailability * 100).toFixed(1)}%.`);
  }
  if (vendorGapPP && topPlatform && bottomPlatform && Number(vendorGapPP) > 0) {
    insightLines.push(
      `${bottomPlatform.platform.charAt(0).toUpperCase() + bottomPlatform.platform.slice(1)} trails ${topPlatform.platform.charAt(0).toUpperCase() + topPlatform.platform.slice(1)} by ${vendorGapPP}pp.`
    );
  }
  if (vendorGapPP && Number(vendorGapPP) > 2) {
    insightLines.push("This gap suggests platform-specific listing or replenishment issues.");
  } else if (mustHaveDeltaPP != null && mustHaveDeltaPP < 0) {
    insightLines.push(
      `Must-have products miss the 90% target by ${Math.abs(mustHaveDeltaPP).toFixed(1)}pp, indicating frequent out-of-stock days.`
    );
  }
  if (bottomPlatform) {
    insightLines.push(
      `Prioritize must-have SKUs with availability below 70% on ${bottomPlatform.platform.charAt(0).toUpperCase() + bottomPlatform.platform.slice(1)}.`
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <KeyTakeaways variant="ola" />
        <VendorHealthOverview variant="ola" />

        {/* Executive Snapshot */}
        <section>
          <SectionHeader
            title="Executive Snapshot"
            subtitle="Key availability metrics at a glance"
            action={<DataStatusIndicator status={dataStatus} />}
          />
          {insightLines.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 mb-5 space-y-1">
              {insightLines.map((line, i) => (
                <p key={i} className="text-xs text-foreground leading-snug">{line}</p>
              ))}
            </div>
          )}
          <div className="bg-card rounded-xl border border-border p-6">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                <div className={`text-center border-r border-border pr-6 rounded-lg py-3 ${availBand.bg}`}>
                  <p className="text-5xl font-extrabold tracking-tight text-foreground">
                    {avgAvailability != null ? `${(avgAvailability * 100).toFixed(1)}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Overall Availability</p>
                  <span className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold ${availBand.color}`}>
                    {availBand.icon}{availBand.label}
                  </span>
                </div>
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
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">By Platform</span>
                  <div className="space-y-1.5">
                    {execData.map((p) => {
                      const band = getPerformanceBand(p.availability_pct);
                      return (
                        <div key={p.platform} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{p.platform}</span>
                          <span className={`font-semibold ${band.color}`}>
                            {p.availability_pct != null ? `${(p.availability_pct * 100).toFixed(1)}%` : "—"}
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

        {/* Structural Trends — date filter applies ONLY here */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader
              title="Structural Trends"
              subtitle="Temporal patterns and platform comparison"
            />
            <DateRangeFilter />
          </div>
          <AvailabilityTrendChart />
        </section>

        <ExecutionDiagnostics variant="ola" />

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

        <section>
          <AlignmentInsight />
        </section>
      </div>
    </DashboardLayout>
  );
}
