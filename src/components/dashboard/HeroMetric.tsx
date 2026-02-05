 import { cn } from "@/lib/utils";
 import { TrendingUp, TrendingDown } from "lucide-react";
 import { ReactNode } from "react";
 
 interface HeroMetricProps {
   label: string;
   value: string | number;
   trend?: {
     value: number;
     direction: "up" | "down";
   };
   subtitle?: string;
   icon?: ReactNode;
   gradient?: "primary" | "success" | "warning" | "info";
   className?: string;
 }
 
 const gradientStyles = {
   primary: "from-primary/10 via-primary/5 to-transparent",
   success: "from-status-success/10 via-status-success/5 to-transparent",
   warning: "from-status-warning/10 via-status-warning/5 to-transparent",
   info: "from-status-info/10 via-status-info/5 to-transparent",
 };
 
 export function HeroMetric({
   label,
   value,
   trend,
   subtitle,
   icon,
   gradient = "primary",
   className,
 }: HeroMetricProps) {
   return (
     <div
       className={cn(
         "relative overflow-hidden rounded-xl border border-border bg-card p-8",
         className
       )}
     >
       {/* Gradient background */}
       <div
         className={cn(
           "absolute inset-0 bg-gradient-to-br opacity-60",
           gradientStyles[gradient]
         )}
       />
       
       <div className="relative flex items-start justify-between">
         <div className="space-y-2">
           <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
             {label}
           </p>
           <p className="text-5xl font-bold text-foreground tracking-tight">{value}</p>
           <div className="flex items-center gap-3 pt-1">
             {trend && (
               <span
                 className={cn(
                   "flex items-center gap-1 text-sm font-medium",
                   trend.direction === "up" ? "text-status-success" : "text-status-danger"
                 )}
               >
                 {trend.direction === "up" ? (
                   <TrendingUp className="w-4 h-4" />
                 ) : (
                   <TrendingDown className="w-4 h-4" />
                 )}
                 {trend.value}%
               </span>
             )}
             {subtitle && (
               <span className="text-sm text-muted-foreground">{subtitle}</span>
             )}
           </div>
         </div>
         {icon && (
           <div className="p-3 rounded-xl bg-primary/10 text-primary">
             {icon}
           </div>
         )}
       </div>
     </div>
   );
 }