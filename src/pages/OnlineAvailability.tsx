import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InlineInsight } from "@/components/dashboard/InlineInsight";
import { AvailabilityTrendChart } from "@/components/dashboard/AvailabilityTrendChart";
import { Package, TrendingUp, TrendingDown, AlertTriangle, Star, MapPin, Check, X } from "lucide-react";
import { olaKPIs, olaPincodeData, olaSkuPincodeData, olaLowAvailabilitySKUs } from "@/data/mockData";
import { useDateRange } from "@/contexts/DateRangeContext";
import { cn } from "@/lib/utils";
import { CHART_LIMITS } from "@/lib/metrics";

export default function OnlineAvailability() {
  const { getTimePhrase } = useDateRange();
  
  const getAvailabilityColor = (pct: number) => {
    if (pct >= 90) return "bg-status-success";
    if (pct >= 70) return "bg-status-info";
    if (pct >= 50) return "bg-status-warning";
    return "bg-status-error";
  };
  
  const getAvailabilityBg = (pct: number) => {
    if (pct >= 90) return "bg-status-success/10 border-status-success/20";
    if (pct >= 70) return "bg-status-info/10 border-status-info/20";
    if (pct >= 50) return "bg-status-warning/10 border-status-warning/20";
    return "bg-status-error/10 border-status-error/20";
  };

  // Truncate data to chart limits
  const displayPincodeData = olaPincodeData.slice(0, CHART_LIMITS.maxRows);
  const displaySkuData = olaSkuPincodeData.slice(0, 5);
  const displayCriticalSKUs = olaLowAvailabilitySKUs.slice(0, CHART_LIMITS.maxRows);

  // Time-aware decision summaries
  const decisionSummaries = [
    olaKPIs.skusAtRisk.value > 5 
      ? `Address ${olaKPIs.skusAtRisk.value} at-risk SKUs ${getTimePhrase()}—potential revenue loss in key pincodes`
      : `SKU availability stable ${getTimePhrase()} with only ${olaKPIs.skusAtRisk.value} items requiring attention`,
    olaKPIs.mustHaveAvailability.value < 90
      ? `Escalate must-have SKU gaps: ${100 - olaKPIs.mustHaveAvailability.value}% unavailability ${getTimePhrase()} impacts core assortment`
      : `Must-have coverage at ${olaKPIs.mustHaveAvailability.value}% ${getTimePhrase()}—maintain current replenishment cadence`,
    olaKPIs.newLaunchAvailability.value < 80
      ? `Prioritize new launch distribution: ${olaKPIs.newLaunchAvailability.value}% availability ${getTimePhrase()} limits market penetration`
      : `New launches performing well at ${olaKPIs.newLaunchAvailability.value}% availability ${getTimePhrase()}`,
  ];

  // Time-aware insights
  const olaInsights = [
    {
      id: "1",
      type: "alert" as const,
      title: "Critical stockout: Dove Body Wash",
      description: `Availability dropped below 25% across 3 merchants ${getTimePhrase()}.`,
    },
    {
      id: "2",
      type: "warning" as const,
      title: "Must-Have SKUs declining",
      description: `Must-Have availability down 0.8% week-over-week. 12 SKUs below threshold ${getTimePhrase()}.`,
    },
    {
      id: "3",
      type: "info" as const,
      title: "New Launch performance",
      description: `New launches showing strong availability growth at +5.3% ${getTimePhrase()}.`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Decision Summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Decision Summary</h2>
          <ul className="space-y-2">
            {decisionSummaries.map((summary, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-foreground leading-relaxed">{summary}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* LEVEL 1: Summary - Single glanceable row */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Availability Overview</h2>
              <p className="text-sm text-muted-foreground">SKU availability across {olaKPIs.totalPincodes.value} tracked pincodes</p>
            </div>
          </div>
          
          {/* Fixed derived metrics: Overall Availability %, SKUs at Risk, Pincodes Affected, Top Pack Availability % */}
          <div className="grid grid-cols-4 gap-6">
            {/* Primary Metric: Overall Availability % */}
            <div className="text-center border-r border-border pr-6">
              <p className="text-5xl font-bold text-foreground">{olaKPIs.overallAvailability.value}%</p>
              <p className="text-sm text-muted-foreground mt-1">Overall Availability %</p>
              <div className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${olaKPIs.overallAvailability.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                {olaKPIs.overallAvailability.trend.direction === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {olaKPIs.overallAvailability.trend.value}% WoW
              </div>
            </div>
            
            {/* SKUs at Risk */}
            <div className="flex flex-col justify-center bg-status-warning/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-status-warning" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">SKUs at Risk</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{olaKPIs.skusAtRisk.value}</p>
              <span className="text-xs text-status-success">↓ {olaKPIs.skusAtRisk.trend.value} vs last week</span>
            </div>
            
            {/* Pincodes Affected */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Pincodes Affected</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{olaKPIs.totalPincodes.value}</p>
              <span className="text-xs text-status-success">+{olaKPIs.totalPincodes.trend.value} tracked</span>
            </div>
            
            {/* Top Pack Availability % */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Top Pack Avail %</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{olaKPIs.topPacksAvailability.value}%</p>
              <span className={`text-xs ${olaKPIs.topPacksAvailability.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                {olaKPIs.topPacksAvailability.trend.direction === "up" ? "+" : ""}{olaKPIs.topPacksAvailability.trend.value}%
              </span>
            </div>
          </div>
        </div>

        {/* LEVEL 2: Primary Temporal Visual */}
        <AvailabilityTrendChart />

        {/* LEVEL 2.5: Pincode Availability */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-foreground">Pincode Availability</h3>
            <p className="text-sm text-muted-foreground">SKU availability by geographic location and merchant</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {olaPincodeData.map((item) => (
              <div 
                key={item.pincode}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  getAvailabilityBg(item.availability)
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-10 rounded-full", getAvailabilityColor(item.availability))} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.location}</p>
                    <p className="text-xs text-muted-foreground">{item.pincode} • {item.merchant}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">{item.availability}%</p>
                  <p className="text-xs text-muted-foreground">{item.available}/{item.total} SKUs</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">Legend:</span>
            {[
              { label: "≥90%", color: "bg-status-success" },
              { label: "70-89%", color: "bg-status-info" },
              { label: "50-69%", color: "bg-status-warning" },
              { label: "<50%", color: "bg-status-error" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded", item.color)} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inline Insights */}
        <div className="grid grid-cols-3 gap-4">
          {olaInsights.map((insight) => (
            <InlineInsight
              key={insight.id}
              type={insight.type}
              title={insight.title}
              description={insight.description}
            />
          ))}
        </div>

        {/* LEVEL 3: SKU × Pincode Detail */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-foreground">SKU × Pincode Availability</h3>
            <p className="text-sm text-muted-foreground">Detailed availability patterns by product and location</p>
          </div>
          
          <div className="space-y-3">
            {olaSkuPincodeData.map((sku) => (
              <div key={sku.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{sku.basepack}</p>
                      {sku.mustHave && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">Must-Have</span>
                      )}
                      {sku.topPack && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-status-info/10 text-status-info rounded">Top Pack</span>
                      )}
                      {sku.newLaunch && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-status-warning/10 text-status-warning rounded">New</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">EAN: {sku.ean} • {sku.salesCategory}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-semibold",
                      sku.availabilityPct >= 70 ? "text-status-success" : sku.availabilityPct >= 50 ? "text-status-warning" : "text-status-error"
                    )}>
                      {sku.availabilityPct}%
                    </p>
                    <p className="text-xs text-muted-foreground">{sku.totalAvailable}/{sku.totalPincodes} pincodes</p>
                  </div>
                </div>
                
                {/* Pincode breakdown */}
                <div className="grid grid-cols-4 gap-2">
                  {sku.pincodeAvailability.map((pa) => (
                    <div 
                      key={pa.pincode}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded text-xs",
                        pa.available ? "bg-status-success/10" : "bg-status-error/10"
                      )}
                    >
                      <div>
                        <p className="font-medium text-foreground">{pa.pincode}</p>
                        <p className="text-muted-foreground">{pa.merchant}</p>
                      </div>
                      {pa.available ? (
                        <div className="text-right">
                          <Check className="w-4 h-4 text-status-success" />
                          {pa.salePrice && <p className="text-status-success">₹{pa.salePrice}</p>}
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-status-error" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LEVEL 4: Critical SKU Rankings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-foreground">Critical SKUs</h3>
            <p className="text-sm text-muted-foreground">Products requiring immediate attention based on low availability</p>
          </div>
          
          <div className="space-y-2">
            {olaLowAvailabilitySKUs.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-6">#{item.rank}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{item.metadata?.Customer}</p>
                    <p className="text-xs text-muted-foreground">{item.metadata?.Location}</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-semibold",
                    item.status === "critical" ? "bg-status-error/10 text-status-error" :
                    item.status === "high" ? "bg-status-warning/10 text-status-warning" :
                    "bg-status-info/10 text-status-info"
                  )}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
