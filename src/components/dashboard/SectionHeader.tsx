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
          "flex items-end justify-between pb-3 mb-4 border-b border-border",
          className
       )}
     >
       <div>
         <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
         {subtitle && (
           <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
         )}
       </div>
       {action}
     </div>
   );
 }