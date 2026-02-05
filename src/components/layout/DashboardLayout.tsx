 import { ReactNode } from "react";
 import { NavLink, useLocation } from "react-router-dom";
 import { Package, Search, Store, LayoutGrid, Bell, Settings } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface DashboardLayoutProps {
   children: ReactNode;
 }
 
 const navItems = [
   { path: "/ola", label: "Online Availability", icon: Package, shortLabel: "OLA" },
   { path: "/sos", label: "Share of Search", icon: Search, shortLabel: "SoS" },
   { path: "/pso", label: "Perfect Store Online", icon: Store, shortLabel: "PSO" },
   { path: "/soa", label: "Share of Assortment", icon: LayoutGrid, shortLabel: "SoA" },
 ];
 
 export function DashboardLayout({ children }: DashboardLayoutProps) {
   const location = useLocation();
 
   return (
     <div className="flex h-screen overflow-hidden">
       {/* Sidebar */}
       <aside className="w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
         <div className="p-6 border-b border-sidebar-border">
           <h1 className="text-xl font-bold text-sidebar-primary-foreground">
             Retail<span className="text-sidebar-primary">Intel</span>
           </h1>
           <p className="text-xs text-sidebar-foreground mt-1">FMCG Analytics Dashboard</p>
         </div>
 
         <nav className="flex-1 p-4 space-y-1">
           {navItems.map((item) => {
             const isActive = location.pathname === item.path;
             return (
               <NavLink
                 key={item.path}
                 to={item.path}
                 className={cn(
                   "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                   isActive
                     ? "bg-sidebar-accent text-sidebar-accent-foreground"
                     : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                 )}
               >
                 <item.icon className="w-5 h-5" />
                 <span>{item.label}</span>
                 <span className="ml-auto text-xs opacity-60">{item.shortLabel}</span>
               </NavLink>
             );
           })}
         </nav>
 
         <div className="p-4 border-t border-sidebar-border">
           <div className="flex items-center gap-3 px-4 py-2 text-sm text-sidebar-foreground">
             <Settings className="w-4 h-4" />
             <span>Settings</span>
           </div>
         </div>
       </aside>
 
       {/* Main Content */}
       <main className="flex-1 overflow-auto">
         {/* Header */}
         <header className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
           <div>
             <h2 className="text-lg font-semibold text-foreground">
               {navItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
             </h2>
             <p className="text-sm text-muted-foreground">Last updated: Feb 5, 2026 12:30 PM</p>
           </div>
           <div className="flex items-center gap-4">
             <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
               <Bell className="w-5 h-5 text-muted-foreground" />
               <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full" />
             </button>
           </div>
         </header>
 
         {/* Page Content */}
         <div className="p-6">{children}</div>
       </main>
     </div>
   );
 }