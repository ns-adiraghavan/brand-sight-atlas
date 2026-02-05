 import { cn } from "@/lib/utils";
 import { ReactNode } from "react";
 
 interface SectionHeaderProps {
   title: string;
   subtitle?: string;
   action?: ReactNode;
   className?: string;
 }
 
 export function SectionHeader({
   title,
   subtitle,
   action,
   className,
 }: SectionHeaderProps) {
   return (
     <div
       className={cn(
         "flex items-end justify-between pb-4 mb-6 border-b border-border",
         className
       )}
     >
       <div>
         <h3 className="text-lg font-semibold text-foreground">{title}</h3>
         {subtitle && (
           <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
         )}
       </div>
       {action}
     </div>
   );
 }