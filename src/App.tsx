import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DateRangeProvider } from "@/contexts/DateRangeContext";
import { ModuleVisibilityProvider } from "@/contexts/ModuleVisibilityContext";
import OnlineAvailability from "./pages/OnlineAvailability";
import ShareOfSearch from "./pages/ShareOfSearch";
import PerfectStoreOnline from "./pages/PerfectStoreOnline";
import ShareOfAssortment from "./pages/ShareOfAssortment";
import NotFound from "./pages/NotFound";
import DataLineage from "./pages/DataLineage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DateRangeProvider>
        <ModuleVisibilityProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/ola" replace />} />
              <Route path="/ola" element={<OnlineAvailability />} />
              <Route path="/sos" element={<ShareOfSearch />} />
              <Route path="/pso" element={<PerfectStoreOnline />} />
              <Route path="/soa" element={<ShareOfAssortment />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ModuleVisibilityProvider>
      </DateRangeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
