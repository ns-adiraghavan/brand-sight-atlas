 import { AlertTriangle, TrendingDown, Info, ChevronRight } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 type InsightType = "alert" | "warning" | "info";
 
 interface Insight {
   id: string;
   type: InsightType;
   title: string;
   description: string;
   timestamp?: string;
 }
 
 interface InsightPanelProps {
   title: string;
   insights: Insight[];
   className?: string;
 }
 
 const typeConfig: Record<InsightType, { icon: typeof AlertTriangle; colorClass: string }> = {
   alert: { icon: AlertTriangle, colorClass: "text-status-danger bg-status-danger-bg" },
   warning: { icon: TrendingDown, colorClass: "text-status-warning bg-status-warning-bg" },
   info: { icon: Info, colorClass: "text-status-info bg-status-info-bg" },
 };
 
 export function InsightPanel({ title, insights, className }: InsightPanelProps) {
   return (
     <div className={cn("insight-panel", className)}>
       <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
 
       <div className="space-y-3">
         {insights.length === 0 ? (
           <p className="text-sm text-muted-foreground py-4 text-center">No alerts at this time</p>
         ) : (
           insights.map((insight) => {
             const config = typeConfig[insight.type];
             const Icon = config.icon;
 
             return (
               <div
                 key={insight.id}
                 className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
               >
                 <div className={cn("p-1.5 rounded", config.colorClass)}>
                   <Icon className="w-4 h-4" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-foreground">{insight.title}</p>
                   <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{insight.description}</p>
                   {insight.timestamp && (
                     <p className="text-xs text-muted-foreground/70 mt-1">{insight.timestamp}</p>
                   )}
                 </div>
                 <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
             );
           })
         )}
       </div>
     </div>
   );
 }