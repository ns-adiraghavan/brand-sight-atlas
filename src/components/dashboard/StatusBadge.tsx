 import { cn } from "@/lib/utils";
 
 type StatusLevel = "critical" | "high" | "medium" | "low";
 
 interface StatusBadgeProps {
   level: StatusLevel;
   children?: React.ReactNode;
   className?: string;
 }
 
 export function StatusBadge({ level, children, className }: StatusBadgeProps) {
   const levelLabels: Record<StatusLevel, string> = {
     critical: "Critical",
     high: "High",
     medium: "Medium",
     low: "Low",
   };
 
   return (
     <span
       className={cn(
         "status-badge",
         {
           "status-critical": level === "critical",
           "status-high": level === "high",
           "status-medium": level === "medium",
           "status-low": level === "low",
         },
         className
       )}
     >
       {children || levelLabels[level]}
     </span>
   );
 }