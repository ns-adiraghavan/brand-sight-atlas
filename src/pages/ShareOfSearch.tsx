 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { InlineInsight } from "@/components/dashboard/InlineInsight";
 import { RankedList } from "@/components/dashboard/RankedList";
 import { Search, TrendingUp, TrendingDown, Hash, Target } from "lucide-react";
 import { sosKPIs, sosTopPerformers, sosBottomPerformers, sosInsights } from "@/data/mockData";
 
 export default function ShareOfSearch() {
   return (
     <DashboardLayout>
       <div className="space-y-6">
         {/* LEVEL 1: Summary - Search performance at a glance */}
         <div className="bg-card rounded-xl border border-border p-6">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2.5 rounded-lg bg-primary/10">
               <Search className="w-5 h-5 text-primary" />
             </div>
             <div>
               <h2 className="text-lg font-semibold text-foreground">Search Performance</h2>
               <p className="text-sm text-muted-foreground">Keyword rankings across all tracked search terms</p>
             </div>
           </div>
           
           <div className="grid grid-cols-4 gap-6">
             {/* Primary Metric - Average Rank */}
             <div className="text-center border-r border-border pr-6">
               <p className="text-5xl font-bold text-foreground">#{sosKPIs.avgSearchRank.value}</p>
               <p className="text-sm text-muted-foreground mt-1">Average Search Rank</p>
               <div className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${sosKPIs.avgSearchRank.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                 {sosKPIs.avgSearchRank.trend.direction === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                 {sosKPIs.avgSearchRank.trend.value} positions
               </div>
               <p className="text-xs text-muted-foreground mt-1">lower is better</p>
             </div>
             
             {/* Secondary Metrics */}
             <div className="flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-1">
                 <Hash className="w-4 h-4 text-muted-foreground" />
                 <span className="text-xs text-muted-foreground uppercase tracking-wide">Keywords Tracked</span>
               </div>
               <p className="text-2xl font-semibold text-foreground">{sosKPIs.keywordsTracked.value}</p>
               <span className="text-xs text-status-success">+{sosKPIs.keywordsTracked.trend.value} new this week</span>
             </div>
             
             <div className="flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-1">
                 <Target className="w-4 h-4 text-muted-foreground" />
                 <span className="text-xs text-muted-foreground uppercase tracking-wide">Brand Share</span>
               </div>
               <p className="text-2xl font-semibold text-foreground">{sosKPIs.brandShare.value}%</p>
               <span className={`text-xs ${sosKPIs.brandShare.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                 {sosKPIs.brandShare.trend.direction === "up" ? "+" : "-"}{sosKPIs.brandShare.trend.value}% WoW
               </span>
             </div>
             
             <div className="flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-1">
                 <Search className="w-4 h-4 text-muted-foreground" />
                 <span className="text-xs text-muted-foreground uppercase tracking-wide">Organic Share</span>
               </div>
               <p className="text-2xl font-semibold text-foreground">{sosKPIs.organicShare.value}%</p>
               <span className={`text-xs ${sosKPIs.organicShare.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                 {sosKPIs.organicShare.trend.direction === "up" ? "+" : "-"}{sosKPIs.organicShare.trend.value}% WoW
               </span>
             </div>
           </div>
         </div>
 
         {/* LEVEL 2: Breakdown - Rankings by search type */}
         <div className="bg-card rounded-xl border border-border p-6">
           <div className="mb-5">
             <h3 className="text-base font-semibold text-foreground">Ranking Distribution by Search Type</h3>
             <p className="text-sm text-muted-foreground">Performance across organic, sponsored, and brand sponsored results</p>
           </div>
           
           <div className="grid grid-cols-3 gap-4">
             {[
               { label: "Organic", value: sosKPIs.organicShare.value, trend: sosKPIs.organicShare.trend, desc: "Natural search results" },
               { label: "Sponsored", value: sosKPIs.sponsoredShare.value, trend: sosKPIs.sponsoredShare.trend, desc: "Paid ad placements" },
               { label: "Brand Sponsored", value: sosKPIs.brandShare.value, trend: sosKPIs.brandShare.trend, desc: "Brand-specific ads" },
             ].map((item) => (
               <div key={item.label} className="bg-muted/30 rounded-lg p-4">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-sm font-medium text-foreground">{item.label}</span>
                   <span className={`text-xs font-medium ${item.trend.direction === "up" ? "text-status-success" : "text-status-error"}`}>
                     {item.trend.direction === "up" ? "↑" : "↓"} {item.trend.value}%
                   </span>
                 </div>
                 <p className="text-3xl font-bold text-foreground">{item.value}%</p>
                 <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                 {/* Progress bar */}
                 <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-primary rounded-full transition-all"
                     style={{ width: `${item.value}%` }}
                   />
                 </div>
               </div>
             ))}
           </div>
         </div>
 
         {/* LEVEL 3: Diagnostics - Insights + Rankings */}
         <div className="grid grid-cols-3 gap-6">
           {/* Insights Column */}
           <div className="col-span-1 space-y-3">
             <h3 className="text-sm font-semibold text-foreground mb-3">Recent Insights</h3>
             {sosInsights.map((insight) => (
               <InlineInsight
                 key={insight.id}
                 type={insight.type}
                 title={insight.title}
                 description={insight.description}
               />
             ))}
           </div>
           
           {/* Rankings - Side by side */}
           <div className="col-span-2 grid grid-cols-2 gap-4">
             <RankedList
               title="Top Performers"
               subtitle="Best search positions"
               items={sosTopPerformers.slice(0, 4)}
             />
             <RankedList
               title="Needs Attention"
               subtitle="Lowest search positions"
               items={sosBottomPerformers.slice(0, 4)}
             />
           </div>
         </div>
       </div>
     </DashboardLayout>
   );
 }