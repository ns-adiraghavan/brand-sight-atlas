 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { LayoutGrid, TrendingUp, Tag, DollarSign, Percent } from "lucide-react";
 
 export default function ShareOfAssortment() {
   return (
     <DashboardLayout>
       <div className="flex items-center justify-center min-h-[60vh]">
         <div className="text-center max-w-lg">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
             <LayoutGrid className="w-8 h-8 text-primary" />
           </div>
           <h2 className="text-2xl font-semibold text-foreground mb-3">Share of Assortment</h2>
           <p className="text-muted-foreground mb-6">
             Coming soon. This module will analyze category taxonomy, rank movements, and competitive positioning across platforms.
           </p>
 
           {/* Preview of future features */}
           <div className="grid grid-cols-2 gap-4 mt-8">
             <div className="bg-card border border-border rounded-lg p-4 text-left">
               <TrendingUp className="w-5 h-5 text-status-success mb-2" />
               <h4 className="text-sm font-medium text-foreground">Rank & Movement</h4>
               <p className="text-xs text-muted-foreground mt-1">Track position changes over time</p>
             </div>
             <div className="bg-card border border-border rounded-lg p-4 text-left">
               <LayoutGrid className="w-5 h-5 text-status-info mb-2" />
               <h4 className="text-sm font-medium text-foreground">Category Taxonomy</h4>
               <p className="text-xs text-muted-foreground mt-1">Hierarchical category analysis</p>
             </div>
             <div className="bg-card border border-border rounded-lg p-4 text-left">
               <Tag className="w-5 h-5 text-status-warning mb-2" />
               <h4 className="text-sm font-medium text-foreground">Platform Tags</h4>
               <p className="text-xs text-muted-foreground mt-1">Bestseller, Prime, etc.</p>
             </div>
             <div className="bg-card border border-border rounded-lg p-4 text-left">
               <Percent className="w-5 h-5 text-primary mb-2" />
               <h4 className="text-sm font-medium text-foreground">Pricing & Discount</h4>
               <p className="text-xs text-muted-foreground mt-1">Price positioning analysis</p>
             </div>
           </div>
         </div>
       </div>
     </DashboardLayout>
   );
 }