 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { KPICard } from "@/components/dashboard/KPICard";
 import { Heatmap } from "@/components/dashboard/Heatmap";
 import { RankedList } from "@/components/dashboard/RankedList";
 import { InsightPanel } from "@/components/dashboard/InsightPanel";
 import { sosKPIs, sosHeatmapData, sosTopPerformers, sosBottomPerformers, sosInsights } from "@/data/mockData";
 
 export default function ShareOfSearch() {
   const searchTypes = ["Brand Sponsored", "Sponsored", "Organic"];
   const keywordCategories = ["Shampoo", "Body Wash", "Detergent", "Tea", "Instant Noodles"];
 
   return (
     <DashboardLayout>
       <div className="flex gap-6">
         {/* Main Content */}
         <div className="flex-1 space-y-6">
           {/* KPI Cards */}
           <div className="grid grid-cols-5 gap-4">
             <KPICard
               label="Brand Share"
               value={`${sosKPIs.brandShare.value}%`}
               trend={sosKPIs.brandShare.trend}
               subtitle="vs last week"
             />
             <KPICard
               label="Organic Share"
               value={`${sosKPIs.organicShare.value}%`}
               trend={sosKPIs.organicShare.trend}
               subtitle="vs last week"
             />
             <KPICard
               label="Sponsored Share"
               value={`${sosKPIs.sponsoredShare.value}%`}
               trend={sosKPIs.sponsoredShare.trend}
               subtitle="vs last week"
             />
             <KPICard
               label="Avg Search Rank"
               value={sosKPIs.avgSearchRank.value}
               trend={sosKPIs.avgSearchRank.trend}
               subtitle="lower is better"
             />
             <KPICard
               label="Keywords Tracked"
               value={sosKPIs.keywordsTracked.value}
               trend={sosKPIs.keywordsTracked.trend}
               subtitle="active keywords"
             />
           </div>
 
           {/* Search Share Heatmap */}
           <Heatmap
             title="Search Share by Category & Type"
             subtitle="Percentage of search results captured"
             data={sosHeatmapData}
             rowLabels={keywordCategories}
             colLabels={searchTypes}
           />
 
           {/* Top and Bottom Performers */}
           <div className="grid grid-cols-2 gap-6">
             <RankedList
               title="Top Performers"
               subtitle="Best search rank positions"
               items={sosTopPerformers}
             />
             <RankedList
               title="Needs Attention"
               subtitle="Lowest search rank positions"
               items={sosBottomPerformers}
             />
           </div>
         </div>
 
         {/* Right Panel */}
         <div className="w-80 space-y-6">
           <InsightPanel title="Alerts & Insights" insights={sosInsights} />
 
           {/* Share Distribution */}
           <div className="bg-card rounded-lg border border-border p-5">
             <h3 className="text-sm font-semibold text-foreground mb-4">Share Distribution</h3>
             <div className="space-y-4">
               {searchTypes.map((type) => {
                 const total = keywordCategories.reduce(
                   (sum, cat) => sum + (sosHeatmapData[cat]?.[type]?.value || 0),
                   0
                 );
                 const avg = Math.round(total / keywordCategories.length);
                 return (
                   <div key={type}>
                     <div className="flex items-center justify-between mb-1">
                       <span className="text-sm text-muted-foreground">{type}</span>
                       <span className="text-sm font-medium text-foreground">{avg}%</span>
                     </div>
                     <div className="h-2 bg-secondary rounded-full overflow-hidden">
                       <div
                         className="h-full bg-primary rounded-full transition-all"
                         style={{ width: `${avg}%` }}
                       />
                     </div>
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