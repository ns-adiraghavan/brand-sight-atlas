import { DashboardLayout } from "@/components/layout/DashboardLayout";

import { AvailabilityTrendChart } from "@/components/dashboard/AvailabilityTrendChart";
import { PincodeVolatilityScatter } from "@/components/dashboard/PincodeVolatilityScatter";
import { BottomSKUsTable } from "@/components/dashboard/BottomSKUsTable";
import { AvailabilityDistribution } from "@/components/dashboard/AvailabilityDistribution";
import { DataStatusIndicator, useDataStatus } from "@/components/dashboard/DataStatusIndicator";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TrendingUp, TrendingDown, AlertTriangle, Star, MapPin } from "lucide-react";
import { olaKPIs } from "@/data/mockData";
import { useDateRange } from "@/contexts/DateRangeContext";
import { applyProbabilisticLanguage } from "@/lib/insights";
import { AlignmentInsight } from "@/components/dashboard/AlignmentInsight";

export default function OnlineAvailability() {
  const { preset, getTimePhrase } = useDateRange();
  const dataStatus = useDataStatus(preset);


  // Executive insight — strategic, board-level framing
  const availDirection = olaKPIs.overallAvailability.trend.direction === "up" ? "trending positively" : "under pressure";
  const mustHaveGap = olaKPIs.mustHaveAvailability.value < 90;
  const riskConcentration = olaKPIs.skusAtRisk.value > 5 ? "concentrated" : "manageable";

  const execInsight = applyProbabilisticLanguage(
    `Availability is ${availDirection} ${getTimePhrase()}, though risk remains ${riskConcentration} across a narrow set of SKUs.${mustHaveGap ? " Must-Have coverage continues to trail the target threshold—a structural gap that warrants replenishment strategy review." : ""} Sustained improvement will depend on pincode-level consistency and tail-SKU stabilization.`,
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

          {/* KPI row */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-4 gap-6">
              {/* Overall Availability % */}
              <div className="text-center border-r border-border pr-6">
                <p className="text-4xl font-bold text-foreground">{olaKPIs.overallAvailability.value}%</p>
                <p className="text-xs text-muted-foreground mt-1">Overall Availability</p>
                <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${olaKPIs.overallAvailability.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                  {olaKPIs.overallAvailability.trend.direction === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {olaKPIs.overallAvailability.trend.value}% WoW
                </div>
              </div>

              {/* SKUs at Risk */}
              <div className="flex flex-col justify-center bg-status-warning/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-status-warning" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">SKUs at Risk</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{olaKPIs.skusAtRisk.value}</p>
                <span className="text-[10px] text-status-success">↓ {olaKPIs.skusAtRisk.trend.value} vs last week</span>
              </div>

              {/* Pincodes Affected */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Pincodes Tracked</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{olaKPIs.totalPincodes.value}</p>
                <span className="text-[10px] text-status-success">+{olaKPIs.totalPincodes.trend.value} new</span>
              </div>

              {/* Top Pack Availability % */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Top Pack Avail</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{olaKPIs.topPacksAvailability.value}%</p>
                <span className={`text-[10px] ${olaKPIs.topPacksAvailability.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                  {olaKPIs.topPacksAvailability.trend.direction === "up" ? "+" : ""}{olaKPIs.topPacksAvailability.trend.value}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2: STRUCTURAL TRENDS ===== */}
        <section>
          <SectionHeader
            title="Structural Trends"
            subtitle="Temporal patterns and platform comparison"
          />

          {/* Main trend chart (already has volatility badge + must-have overlay) */}
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

          {/* Bottom SKUs table */}
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
