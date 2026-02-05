 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { InlineInsight } from "@/components/dashboard/InlineInsight";
 import { Heatmap } from "@/components/dashboard/Heatmap";
 import { RankedList } from "@/components/dashboard/RankedList";
 import { Package, TrendingUp, TrendingDown, AlertTriangle, Star, Sparkles } from "lucide-react";
 import { olaKPIs, olaHeatmapData, olaLowAvailabilitySKUs, olaInsights } from "@/data/mockData";
 
 export default function OnlineAvailability() {
   const merchants = ["Amazon", "Flipkart", "BigBasket", "Blinkit"];
   const categories = ["Personal Care", "Home Care", "Foods", "Beverages", "Health & Beauty"];
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         {/* LEVEL 1: Summary - Single glanceable row */}
         <div className="bg-card rounded-xl border border-border p-6">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2.5 rounded-lg bg-primary/10">
               <Package className="w-5 h-5 text-primary" />
             </div>
             <div>
               <h2 className="text-lg font-semibold text-foreground">Availability Overview</h2>
               <p className="text-sm text-muted-foreground">Current week performance across all merchants</p>
             </div>
           </div>
           
           <div className="grid grid-cols-5 gap-6">
             {/* Primary Metric */}
             <div className="col-span-1 text-center border-r border-border pr-6">
               <p className="text-5xl font-bold text-foreground">{olaKPIs.overallAvailability.value}%</p>
               <p className="text-sm text-muted-foreground mt-1">Overall Availability</p>
               <div className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${olaKPIs.overallAvailability.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                 {olaKPIs.overallAvailability.trend.direction === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                 {olaKPIs.overallAvailability.trend.value}% WoW
               </div>
             </div>
             
             {/* Secondary Metrics */}
             <div className="col-span-4 grid grid-cols-4 gap-4">
               <div className="flex flex-col justify-center">
                 <div className="flex items-center gap-2 mb-1">
                   <Star className="w-4 h-4 text-muted-foreground" />
                   <span className="text-xs text-muted-foreground uppercase tracking-wide">Top Packs</span>
                 </div>
                 <p className="text-2xl font-semibold text-foreground">{olaKPIs.topPacksAvailability.value}%</p>
                 <span className={`text-xs ${olaKPIs.topPacksAvailability.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                   {olaKPIs.topPacksAvailability.trend.direction === "up" ? "+" : "-"}{olaKPIs.topPacksAvailability.trend.value}%
                 </span>
               </div>
               
               <div className="flex flex-col justify-center">
                 <div className="flex items-center gap-2 mb-1">
                   <Package className="w-4 h-4 text-muted-foreground" />
                   <span className="text-xs text-muted-foreground uppercase tracking-wide">Must-Have</span>
                 </div>
                 <p className="text-2xl font-semibold text-foreground">{olaKPIs.mustHaveAvailability.value}%</p>
                 <span className={`text-xs ${olaKPIs.mustHaveAvailability.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                   {olaKPIs.mustHaveAvailability.trend.direction === "up" ? "+" : "-"}{olaKPIs.mustHaveAvailability.trend.value}%
                 </span>
               </div>
               
               <div className="flex flex-col justify-center">
                 <div className="flex items-center gap-2 mb-1">
                   <Sparkles className="w-4 h-4 text-muted-foreground" />
                   <span className="text-xs text-muted-foreground uppercase tracking-wide">New Launches</span>
                 </div>
                 <p className="text-2xl font-semibold text-foreground">{olaKPIs.newLaunchAvailability.value}%</p>
                 <span className={`text-xs ${olaKPIs.newLaunchAvailability.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                   {olaKPIs.newLaunchAvailability.trend.direction === "up" ? "+" : "-"}{olaKPIs.newLaunchAvailability.trend.value}%
                 </span>
               </div>
               
               <div className="flex flex-col justify-center bg-status-warning/5 rounded-lg p-3 -m-3">
                 <div className="flex items-center gap-2 mb-1">
                   <AlertTriangle className="w-4 h-4 text-status-warning" />
                   <span className="text-xs text-muted-foreground uppercase tracking-wide">At Risk</span>
                 </div>
                 <p className="text-2xl font-semibold text-foreground">{olaKPIs.skusAtRisk.value}</p>
                 <span className="text-xs text-status-success">↓ {olaKPIs.skusAtRisk.trend.value} vs last week</span>
               </div>
             </div>
           </div>
         </div>
 
         {/* LEVEL 2: Breakdown - Category × Merchant Matrix */}
         <div className="bg-card rounded-xl border border-border p-6">
           <div className="mb-5">
             <h3 className="text-base font-semibold text-foreground">Category × Merchant Breakdown</h3>
             <p className="text-sm text-muted-foreground">Availability percentage by business segment and retailer</p>
           </div>
           <Heatmap
             title=""
             data={olaHeatmapData}
             rowLabels={categories}
             colLabels={merchants}
           />
         </div>
 
         {/* LEVEL 3: Diagnostics - Insights + Action Items */}
         <div className="grid grid-cols-3 gap-6">
           {/* Insights Column */}
           <div className="col-span-1 space-y-3">
             <h3 className="text-sm font-semibold text-foreground mb-3">Recent Insights</h3>
             {olaInsights.map((insight) => (
               <InlineInsight
                 key={insight.id}
                 type={insight.type}
                 title={insight.title}
                 description={insight.description}
               />
             ))}
           </div>
           
           {/* Critical SKUs - Takes 2 columns */}
           <div className="col-span-2">
             <RankedList
               title="Critical SKUs"
               subtitle="Items requiring immediate attention"
               items={olaLowAvailabilitySKUs}
             />
           </div>
         </div>
       </div>
     </DashboardLayout>
   );
 }