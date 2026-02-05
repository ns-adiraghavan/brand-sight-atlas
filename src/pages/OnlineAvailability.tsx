 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { KPICard } from "@/components/dashboard/KPICard";
 import { Heatmap } from "@/components/dashboard/Heatmap";
 import { RankedList } from "@/components/dashboard/RankedList";
 import { InsightPanel } from "@/components/dashboard/InsightPanel";
 import { olaKPIs, olaHeatmapData, olaLowAvailabilitySKUs, olaInsights } from "@/data/mockData";
 
 export default function OnlineAvailability() {
   const merchants = ["Amazon", "Flipkart", "BigBasket", "Blinkit"];
   const categories = ["Personal Care", "Home Care", "Foods", "Beverages", "Health & Beauty"];
 
   return (
     <DashboardLayout>
       <div className="flex gap-6">
         {/* Main Content */}
         <div className="flex-1 space-y-6">
           {/* KPI Cards */}
           <div className="grid grid-cols-5 gap-4">
             <KPICard
               label="Overall Availability"
               value={`${olaKPIs.overallAvailability.value}%`}
               trend={olaKPIs.overallAvailability.trend}
               subtitle="vs last week"
             />
             <KPICard
               label="Top Packs"
               value={`${olaKPIs.topPacksAvailability.value}%`}
               trend={olaKPIs.topPacksAvailability.trend}
               subtitle="vs last week"
             />
             <KPICard
               label="Must-Have SKUs"
               value={`${olaKPIs.mustHaveAvailability.value}%`}
               trend={olaKPIs.mustHaveAvailability.trend}
               subtitle="vs last week"
             />
             <KPICard
               label="New Launches"
               value={`${olaKPIs.newLaunchAvailability.value}%`}
               trend={olaKPIs.newLaunchAvailability.trend}
               subtitle="vs last week"
             />
             <KPICard
               label="SKUs at Risk"
               value={olaKPIs.skusAtRisk.value}
               trend={olaKPIs.skusAtRisk.trend}
               subtitle="below 60% avail."
             />
           </div>
 
           {/* Availability Heatmap */}
           <Heatmap
             title="Availability by Category & Merchant"
             subtitle="Current week availability percentage"
             data={olaHeatmapData}
             rowLabels={categories}
             colLabels={merchants}
           />
 
           {/* Low Availability SKUs */}
           <RankedList
             title="Lowest Availability SKUs"
             subtitle="SKUs requiring immediate attention"
             items={olaLowAvailabilitySKUs}
           />
         </div>
 
         {/* Right Panel */}
         <div className="w-80 space-y-6">
           <InsightPanel title="Alerts & Insights" insights={olaInsights} />
 
           {/* Quick Stats */}
           <div className="bg-card rounded-lg border border-border p-5">
             <h3 className="text-sm font-semibold text-foreground mb-4">Category Breakdown</h3>
             <div className="space-y-3">
               {categories.map((category) => {
                 const avgAvail = Math.round(
                   merchants.reduce((sum, m) => sum + (olaHeatmapData[category]?.[m]?.value || 0), 0) / merchants.length
                 );
                 return (
                   <div key={category} className="flex items-center justify-between">
                     <span className="text-sm text-muted-foreground">{category}</span>
                     <span className="text-sm font-medium text-foreground">{avgAvail}%</span>
                   </div>
                 );
               })}
             </div>
           </div>
         </div>
       </div>
     </DashboardLayout>
   );
 }