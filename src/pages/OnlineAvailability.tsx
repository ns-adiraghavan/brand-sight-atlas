 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { HeroMetric } from "@/components/dashboard/HeroMetric";
 import { CompactKPI } from "@/components/dashboard/CompactKPI";
 import { InlineInsight } from "@/components/dashboard/InlineInsight";
 import { SectionHeader } from "@/components/dashboard/SectionHeader";
 import { Heatmap } from "@/components/dashboard/Heatmap";
 import { RankedList } from "@/components/dashboard/RankedList";
 import { Package, AlertTriangle } from "lucide-react";
 import { olaKPIs, olaHeatmapData, olaLowAvailabilitySKUs, olaInsights } from "@/data/mockData";
 
 export default function OnlineAvailability() {
   const merchants = ["Amazon", "Flipkart", "BigBasket", "Blinkit"];
   const categories = ["Personal Care", "Home Care", "Foods", "Beverages", "Health & Beauty"];
 
   return (
     <DashboardLayout>
       <div className="space-y-8">
         {/* Hero Section - Asymmetric layout */}
         <div className="grid grid-cols-3 gap-6">
           {/* Hero Metric - Large */}
           <HeroMetric
             label="Overall Availability"
             value={`${olaKPIs.overallAvailability.value}%`}
             trend={olaKPIs.overallAvailability.trend}
             subtitle="vs last week"
             icon={<Package className="w-6 h-6" />}
             gradient="primary"
             className="col-span-1 row-span-2"
           />
           
           {/* Stacked compact KPIs */}
           <div className="col-span-1 bg-card rounded-xl border border-border p-5">
             <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Pack Performance</p>
             <div className="divide-y divide-border">
               <CompactKPI
                 label="Top Packs"
                 value={`${olaKPIs.topPacksAvailability.value}%`}
                 trend={olaKPIs.topPacksAvailability.trend}
               />
               <CompactKPI
                 label="Must-Have SKUs"
                 value={`${olaKPIs.mustHaveAvailability.value}%`}
                 trend={olaKPIs.mustHaveAvailability.trend}
               />
               <CompactKPI
                 label="New Launches"
                 value={`${olaKPIs.newLaunchAvailability.value}%`}
                 trend={olaKPIs.newLaunchAvailability.trend}
               />
             </div>
           </div>
 
           {/* Alert callout */}
           <div className="col-span-1 bg-card rounded-xl border border-border p-5 flex flex-col justify-between">
             <div>
               <div className="flex items-center gap-2 mb-3">
                 <AlertTriangle className="w-5 h-5 text-status-warning" />
                 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attention Required</p>
               </div>
               <p className="text-4xl font-bold text-foreground">{olaKPIs.skusAtRisk.value}</p>
               <p className="text-sm text-muted-foreground mt-1">SKUs below 60% availability</p>
             </div>
             <div className="mt-4 pt-4 border-t border-border">
               <span className="text-xs text-status-success font-medium">
                 ↓ {olaKPIs.skusAtRisk.trend.value} fewer than last week
               </span>
             </div>
           </div>
         </div>
 
         {/* Inline Insights Row */}
         <div className="grid grid-cols-3 gap-4">
           {olaInsights.map((insight) => (
             <InlineInsight
               key={insight.id}
               type={insight.type}
               title={insight.title}
               description={insight.description}
               action="View"
             />
           ))}
         </div>
 
         {/* Main Content - Wide heatmap hero */}
         <section>
           <SectionHeader
             title="Category × Merchant Analysis"
             subtitle="Current week availability percentage by segment"
           />
           <Heatmap
             title=""
             data={olaHeatmapData}
             rowLabels={categories}
             colLabels={merchants}
           />
         </section>
 
         {/* Bottom Section - Full width list */}
         <section>
           <SectionHeader
             title="Critical SKUs"
             subtitle="Items requiring immediate attention"
           />
           <RankedList
             title=""
             items={olaLowAvailabilitySKUs}
           />
         </section>
       </div>
     </DashboardLayout>
   );
 }