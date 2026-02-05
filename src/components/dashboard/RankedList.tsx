 import { StatusBadge } from "./StatusBadge";
 import { cn } from "@/lib/utils";
 
 type StatusLevel = "critical" | "high" | "medium" | "low";
 
 interface RankedItem {
   id: string;
   rank: number;
   title: string;
   subtitle?: string;
   value: string | number;
   valueLabel?: string;
   status: StatusLevel;
   metadata?: Record<string, string>;
 }
 
 interface RankedListProps {
   title: string;
   subtitle?: string;
   items: RankedItem[];
   className?: string;
   maxItems?: number;
 }
 
 export function RankedList({ title, subtitle, items, className, maxItems = 5 }: RankedListProps) {
   const displayItems = items.slice(0, maxItems);
 
   return (
     <div className={cn("bg-card rounded-lg border border-border p-5", className)}>
       <div className="flex items-center justify-between mb-4">
         <div>
           <h3 className="text-base font-semibold text-foreground">{title}</h3>
           {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
         </div>
         <button className="text-sm text-primary hover:underline">View All</button>
       </div>
 
       <div className="space-y-3">
         {displayItems.map((item) => (
           <div
             key={item.id}
             className={cn(
               "flex items-center gap-4 p-3 rounded-lg border transition-colors hover:bg-secondary/30",
               item.status === "critical" && "border-status-danger/30 bg-status-danger-bg/30",
               item.status === "high" && "border-status-warning/30 bg-status-warning-bg/30",
               item.status === "medium" && "border-border",
               item.status === "low" && "border-border"
             )}
           >
             <span className="text-sm font-bold text-muted-foreground w-6">#{item.rank}</span>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
               {item.subtitle && (
                 <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
               )}
             </div>
             <div className="text-right">
               <p className="text-sm font-semibold text-foreground">{item.value}</p>
               {item.valueLabel && (
                 <p className="text-xs text-muted-foreground">{item.valueLabel}</p>
               )}
             </div>
             <StatusBadge level={item.status} />
           </div>
         ))}
       </div>
     </div>
   );
 }