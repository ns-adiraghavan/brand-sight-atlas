 import { cn } from "@/lib/utils";
 import { TrendingUp, TrendingDown } from "lucide-react";
 
 interface CompactKPIProps {
   label: string;
   value: string | number;
   trend?: {
     value: number;
     direction: "up" | "down";
   };
   className?: string;
 }
 
 export function CompactKPI({ label, value, trend, className }: CompactKPIProps) {
   return (
     <div className={cn("flex items-center justify-between py-3", className)}>
       <span className="text-sm text-muted-foreground">{label}</span>
       <div className="flex items-center gap-2">
         <span className="text-lg font-semibold text-foreground">{value}</span>
         {trend && (
           <span
             className={cn(
               "flex items-center gap-0.5 text-xs font-medium",
               trend.direction === "up" ? "text-status-success" : "text-status-danger"
             )}
           >
             {trend.direction === "up" ? (
               <TrendingUp className="w-3 h-3" />
             ) : (
               <TrendingDown className="w-3 h-3" />
             )}
             {trend.value}%
           </span>
         )}
       </div>
     </div>
   );
 }