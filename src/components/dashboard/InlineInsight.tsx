 import { cn } from "@/lib/utils";
 import { AlertTriangle, AlertCircle, Info, ArrowRight } from "lucide-react";
 
 interface InlineInsightProps {
   type: "alert" | "warning" | "info";
   title: string;
   description?: string;
   action?: string;
   className?: string;
 }
 
 const typeConfig = {
   alert: {
     icon: AlertCircle,
     styles: "border-l-status-danger bg-status-danger-bg/30",
     iconColor: "text-status-danger",
   },
   warning: {
     icon: AlertTriangle,
     styles: "border-l-status-warning bg-status-warning-bg/30",
     iconColor: "text-status-warning",
   },
   info: {
     icon: Info,
     styles: "border-l-status-info bg-status-info-bg/30",
     iconColor: "text-status-info",
   },
 };
 
 export function InlineInsight({
   type,
   title,
   description,
   action,
   className,
 }: InlineInsightProps) {
   const config = typeConfig[type];
   const Icon = config.icon;
 
   return (
     <div
       className={cn(
         "flex items-start gap-3 p-4 rounded-lg border-l-4 border border-border",
         config.styles,
         className
       )}
     >
       <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", config.iconColor)} />
       <div className="flex-1 min-w-0">
         <p className="text-sm font-medium text-foreground">{title}</p>
         {description && (
           <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
         )}
       </div>
       {action && (
         <button className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors shrink-0">
           {action}
           <ArrowRight className="w-4 h-4" />
         </button>
       )}
     </div>
   );
 }