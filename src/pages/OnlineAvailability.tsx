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
      .from("ola_exec_summary")
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

  const availDirection = avgAvailability && avgAvailability > 0.8 ? "trending positively" : "under pressure";
  const mustHaveGap = avgMustHave != null && avgMustHave < 0.9;

  const execInsight = applyProbabilisticLanguage(
    `Availability is ${availDirection} ${getTimePhrase()}.${mustHaveGap ? " Must-Have coverage continues to trail the target threshold—a structural gap that warrants replenishment strategy review." : ""} Sustained improvement will depend on pincode-level consistency and tail-SKU stabilization.`,
    dataStatus.coverage
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ===== SECTION 1: EXECUTIVE SNAPSHOT ===== */}
        <section>
          <SectionHeader
            title="Executive Snapshot"
            subtitle="Key availability metrics at a glance"
            action={<DataStatusIndicator status={dataStatus} />}
          />

          {/* Insight paragraph */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
            <p className="text-sm text-foreground leading-relaxed">{execInsight}</p>
          </div>

          {/* KPI row from ola_exec_summary */}
          <div className="bg-card rounded-xl border border-border p-6">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
            ) : (
              <div className="grid grid-cols-4 gap-6">
                {/* Overall Availability % (avg across platforms) */}
                <div className="text-center border-r border-border pr-6">
                  <p className="text-4xl font-bold text-foreground">
                    {avgAvailability != null ? `${(avgAvailability * 100).toFixed(1)}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Overall Availability</p>
                </div>

                {/* Must-Have Availability */}
                <div className="flex flex-col justify-center bg-status-warning/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-status-warning" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Must-Have Avail</span>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {avgMustHave != null ? `${(avgMustHave * 100).toFixed(1)}%` : "—"}
                  </p>
                </div>

                {/* SKU Reliability */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">SKU Reliability</span>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {avgReliability != null ? `${(avgReliability * 100).toFixed(1)}%` : "—"}
                  </p>
                </div>

                {/* Per-platform breakdown */}
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">By Platform</span>
                  <div className="space-y-1.5">
                    {execData.map((p) => (
                      <div key={p.platform} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground capitalize">{p.platform}</span>
                        <span className="font-medium text-foreground">
                          {(p.availability_pct * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
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
            title="Diagnostic Deep Dive"
            subtitle="Pincode volatility, SKU risk, and availability distribution"
          />

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3">
              <PincodeVolatilityScatter />
            </div>
            <div className="col-span-2">
              <AvailabilityDistribution />
            </div>
          </div>

          <div className="mt-3">
            <BottomSKUsTable />
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
