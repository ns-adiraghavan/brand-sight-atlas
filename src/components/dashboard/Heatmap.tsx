 import { cn } from "@/lib/utils";
 
 type HeatmapLevel = "excellent" | "good" | "moderate" | "poor" | "critical";
 
 interface HeatmapCell {
   value: number;
   level: HeatmapLevel;
   label?: string;
 }
 
 interface HeatmapProps {
   data: Record<string, Record<string, HeatmapCell>>;
   rowLabels: string[];
   colLabels: string[];
   title?: string;
   subtitle?: string;
 }
 
 const levelColors: Record<HeatmapLevel, string> = {
   excellent: "bg-heatmap-excellent text-primary-foreground",
   good: "bg-heatmap-good text-primary-foreground",
   moderate: "bg-heatmap-moderate text-primary-foreground",
   poor: "bg-heatmap-poor text-primary-foreground",
   critical: "bg-heatmap-critical text-primary-foreground",
 };
 
 export function Heatmap({ data, rowLabels, colLabels, title, subtitle }: HeatmapProps) {
   return (
     <div className="bg-card rounded-lg border border-border p-5">
       {(title || subtitle) && (
         <div className="mb-4">
           {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
           {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
         </div>
       )}
 
       <div className="overflow-x-auto">
         <table className="w-full">
           <thead>
             <tr>
               <th className="text-left text-sm font-medium text-muted-foreground p-2"></th>
               {colLabels.map((col) => (
                 <th key={col} className="text-center text-sm font-medium text-muted-foreground p-2 min-w-[100px]">
                   {col}
                 </th>
               ))}
             </tr>
           </thead>
           <tbody>
             {rowLabels.map((row) => (
               <tr key={row}>
                 <td className="text-sm font-medium text-foreground p-2 whitespace-nowrap">{row}</td>
                 {colLabels.map((col) => {
                   const cell = data[row]?.[col];
                   return (
                     <td key={`${row}-${col}`} className="p-1">
                       {cell ? (
                         <div className={cn("heatmap-cell", levelColors[cell.level])}>
                           {cell.value}%
                           {cell.label && (
                             <div className="text-xs opacity-80">{cell.label}</div>
                           )}
                         </div>
                       ) : (
                         <div className="heatmap-cell bg-muted text-muted-foreground">—</div>
                       )}
                     </td>
                   );
                 })}
               </tr>
             ))}
           </tbody>
         </table>
       </div>
 
       {/* Legend */}
       <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
         <span className="text-xs text-muted-foreground">Legend:</span>
         {(["excellent", "good", "moderate", "poor", "critical"] as HeatmapLevel[]).map((level) => (
           <div key={level} className="flex items-center gap-1.5">
             <div className={cn("w-3 h-3 rounded", levelColors[level])} />
             <span className="text-xs text-muted-foreground capitalize">{level}</span>
           </div>
         ))}
       </div>
     </div>
   );
 }