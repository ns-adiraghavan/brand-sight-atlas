 import { DashboardLayout } from "@/components/layout/DashboardLayout";
 import { Store, CheckCircle, XCircle, Image, FileText, Link } from "lucide-react";
 
 export default function PerfectStoreOnline() {
   return (
     <DashboardLayout>
       <div className="flex items-center justify-center min-h-[60vh]">
         <div className="text-center max-w-lg">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
             <Store className="w-8 h-8 text-primary" />
           </div>
           <h2 className="text-2xl font-semibold text-foreground mb-3">Perfect Store Online</h2>
           <p className="text-muted-foreground mb-6">
             Coming soon. This module will track content compliance, image quality, and keyword optimization across your product listings.
           </p>
 
           {/* Preview of future features */}
           <div className="grid grid-cols-2 gap-4 mt-8">
             <div className="bg-card border border-border rounded-lg p-4 text-left">
               <CheckCircle className="w-5 h-5 text-status-success mb-2" />
               <h4 className="text-sm font-medium text-foreground">PASS/FAIL Status</h4>
               <p className="text-xs text-muted-foreground mt-1">Track compliance status per SKU</p>
             </div>
             <div className="bg-card border border-border rounded-lg p-4 text-left">
               <FileText className="w-5 h-5 text-status-info mb-2" />
               <h4 className="text-sm font-medium text-foreground">Keyword Compliance</h4>
               <p className="text-xs text-muted-foreground mt-1">Ensure required keywords are present</p>
             </div>
             <div className="bg-card border border-border rounded-lg p-4 text-left">
               <Image className="w-5 h-5 text-status-warning mb-2" />
               <h4 className="text-sm font-medium text-foreground">Image Compliance</h4>
               <p className="text-xs text-muted-foreground mt-1">Verify image quality standards</p>
             </div>
             <div className="bg-card border border-border rounded-lg p-4 text-left">
               <Link className="w-5 h-5 text-primary mb-2" />
               <h4 className="text-sm font-medium text-foreground">URL Evidence</h4>
               <p className="text-xs text-muted-foreground mt-1">Direct links to product pages</p>
             </div>
           </div>
         </div>
       </div>
     </DashboardLayout>
   );
 }