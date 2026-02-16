import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AvailabilityTrendChart } from "@/components/dashboard/AvailabilityTrendChart";
import { PincodeVolatilityScatter } from "@/components/dashboard/PincodeVolatilityScatter";
import { BottomSKUsTable } from "@/components/dashboard/BottomSKUsTable";
import { AvailabilityDistribution } from "@/components/dashboard/AvailabilityDistribution";
import { DataStatusIndicator, useDataStatus } from "@/components/dashboard/DataStatusIndicator";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from "lucide-react";
import { useDateRange } from "@/contexts/DateRangeContext";
import { applyProbabilisticLanguage } from "@/lib/insights";
import { AlignmentInsight } from "@/components/dashboard/AlignmentInsight";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { supabase } from "@/integrations/supabase/client";

interface ExecSummary {
  platform: string;
  availability_pct: number;
  must_have_availability_pct: number;
  sku_reliability_pct: number;
}

export default function OnlineAvailability() {
  const { preset, getTimePhrase } = useDateRange();
  const dataStatus = useDataStatus(preset);

  const [execData, setExecData] = useState<ExecSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("ola_exec_summary_mat")
      .select("platform, availability_pct, must_have_availability_pct, sku_reliability_pct")
      .then(({ data: rows }) => {
        if (rows) {
          setExecData(
            rows.filter(
              (r) => r.platform && r.availability_pct != null
            ) as ExecSummary[]
          );
        }
        setLoading(false);
      });
  }, []);

  // Aggregate across platforms
  const avgAvailability =
    execData.length > 0
      ? execData.reduce((s, d) => s + (d.availability_pct ?? 0), 0) / execData.length
      : null;
  const avgMustHave =
    execData.length > 0
      ? execData.reduce((s, d) => s + (d.must_have_availability_pct ?? 0), 0) / execData.length
      : null;
  const avgReliability =
    execData.length > 0
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

  const availDirection = avgAvailability && avgAvailability > 0.8 ? "trending positively" : "under pressure";

  const execInsight = applyProbabilisticLanguage(
    `Availability is ${availDirection} ${getTimePhrase()}.${mustHaveDeltaPP != null && mustHaveDeltaPP < 0 ? ` Must-Have trails target by ${Math.abs(mustHaveDeltaPP).toFixed(1)}pp—review replenishment strategy.` : ""} Focus on pincode consistency and tail-SKU stabilization.`,
    dataStatus.coverage
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">

        {/* ===== SECTION 1: EXECUTIVE SNAPSHOT ===== */}
        <section>
          <SectionHeader
            title="Executive Snapshot"
            subtitle="Key availability metrics at a glance"
            action={<DataStatusIndicator status={dataStatus} />}
          />

          {/* Insight paragraph — 30% shorter */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 mb-5">
            <p className="text-xs text-foreground leading-snug">{execInsight}</p>
          </div>

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

        {/* ===== SECTION 3: DIAGNOSTIC DEEP DIVE ===== */}
        <section>
          <SectionHeader
            title="Diagnostics"
            subtitle="Operational Risk Prioritization"
          />

          <div className="space-y-3">
            <BottomSKUsTable />

            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-3">
                <PincodeVolatilityScatter />
              </div>
              <div className="col-span-2">
                <AvailabilityDistribution />
              </div>
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
