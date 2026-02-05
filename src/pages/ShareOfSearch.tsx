 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { KPICard } from "@/components/dashboard/KPICard";
 import { InlineInsight } from "@/components/dashboard/InlineInsight";
 import { SectionHeader } from "@/components/dashboard/SectionHeader";
 import { Heatmap } from "@/components/dashboard/Heatmap";
 import { RankedList } from "@/components/dashboard/RankedList";
 import { Search, TrendingUp, TrendingDown } from "lucide-react";
 import { sosKPIs, sosHeatmapData, sosTopPerformers, sosBottomPerformers, sosInsights } from "@/data/mockData";
 
 export default function ShareOfSearch() {
   const searchTypes = ["Brand Sponsored", "Sponsored", "Organic"];
   const keywordCategories = ["Shampoo", "Body Wash", "Detergent", "Tea", "Instant Noodles"];
 
   return (
     <DashboardLayout>
       <div className="space-y-8">
         {/* Hero Section - Large Heatmap as dominant visual */}
         <div className="grid grid-cols-4 gap-6">
           {/* Heatmap Hero - Takes 3 columns */}
           <div className="col-span-3">
             <div className="bg-card rounded-xl border border-border p-6">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 rounded-lg bg-primary/10">
                   <Search className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-foreground">Search Visibility Matrix</h3>
                   <p className="text-sm text-muted-foreground">Share of search results by category and type</p>
                 </div>
               </div>
               <Heatmap
                 title=""
                 data={sosHeatmapData}
                 rowLabels={keywordCategories}
                 colLabels={searchTypes}
               />
             </div>
           </div>
 
           {/* Vertical KPI stack */}
           <div className="col-span-1 space-y-4">
             <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-card rounded-xl border border-border p-5">
               <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Brand Share</p>
               <p className="text-4xl font-bold text-foreground mt-2">{sosKPIs.brandShare.value}%</p>
               <div className="flex items-center gap-1 mt-2 text-status-success text-sm font-medium">
                 <TrendingUp className="w-4 h-4" />
                 +{sosKPIs.brandShare.trend.value}%
               </div>
             </div>
             
             <div className="bg-card rounded-xl border border-border p-5">
               <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Rank</p>
               <p className="text-3xl font-bold text-foreground mt-2">#{sosKPIs.avgSearchRank.value}</p>
               <p className="text-xs text-muted-foreground mt-1">lower is better</p>
             </div>
 
             <div className="bg-card rounded-xl border border-border p-5">
               <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keywords</p>
               <p className="text-3xl font-bold text-foreground mt-2">{sosKPIs.keywordsTracked.value}</p>
               <p className="text-xs text-muted-foreground mt-1">actively tracked</p>
             </div>
           </div>
         </div>
 
         {/* Share Breakdown - Horizontal bar visualization */}
         <div className="bg-card rounded-xl border border-border p-6">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="text-sm font-semibold text-foreground">Search Type Performance</h3>
               <p className="text-xs text-muted-foreground mt-0.5">Average share by search result type</p>
             </div>
           </div>
           <div className="flex gap-4 h-16">
             {[
               { label: "Organic", value: sosKPIs.organicShare.value, trend: sosKPIs.organicShare.trend, color: "bg-primary" },
               { label: "Sponsored", value: sosKPIs.sponsoredShare.value, trend: sosKPIs.sponsoredShare.trend, color: "bg-status-info" },
               { label: "Brand Sponsored", value: sosKPIs.brandShare.value, trend: sosKPIs.brandShare.trend, color: "bg-status-warning" },
             ].map((item) => (
               <div
                 key={item.label}
                 className={`${item.color} rounded-lg flex flex-col justify-center px-4 text-white transition-all hover:opacity-90`}
                 style={{ width: `${item.value}%` }}
               >
                 <span className="text-xs font-medium opacity-80">{item.label}</span>
                 <div className="flex items-center gap-2">
                   <span className="text-lg font-bold">{item.value}%</span>
                   {item.trend.direction === "up" ? (
                     <TrendingUp className="w-3 h-3" />
                   ) : (
                     <TrendingDown className="w-3 h-3" />
                   )}
                 </div>
               </div>
             ))}
           </div>
         </div>
 
         {/* Inline Insight - Single prominent callout */}
         {sosInsights[0] && (
           <InlineInsight
             type={sosInsights[0].type}
             title={sosInsights[0].title}
             description={sosInsights[0].description}
             action="Investigate"
           />
         )}
 
         {/* Two-column performers */}
         <section>
           <SectionHeader
             title="Keyword Rankings"
             subtitle="Top and bottom performing search positions"
           />
           <div className="grid grid-cols-2 gap-6">
             <RankedList
               title="Top Performers"
               subtitle="Best positions"
               items={sosTopPerformers.slice(0, 4)}
             />
             <RankedList
               title="Needs Attention"
               subtitle="Lowest positions"
               items={sosBottomPerformers.slice(0, 4)}
             />
           </div>
         </section>
       </div>
     </DashboardLayout>
   );
 }