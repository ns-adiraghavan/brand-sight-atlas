 import { TrendingUp, TrendingDown } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface KPICardProps {
   label: string;
   value: string | number;
   trend?: {
     value: number;
     direction: "up" | "down";
   };
   subtitle?: string;
   className?: string;
 }
 
 export function KPICard({ label, value, trend, subtitle, className }: KPICardProps) {
   return (
     <div className={cn("kpi-card", className)}>
       <p className="kpi-label">{label}</p>
       <p className="kpi-value mt-2">{value}</p>
       <div className="flex items-center justify-between mt-2">
         {trend && (
           <span className={trend.direction === "up" ? "kpi-trend-up" : "kpi-trend-down"}>
             {trend.direction === "up" ? (
               <TrendingUp className="w-3 h-3" />
             ) : (
               <TrendingDown className="w-3 h-3" />
             )}
             {trend.value}%
           </span>
         )}
         {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
       </div>
     </div>
   );
 }