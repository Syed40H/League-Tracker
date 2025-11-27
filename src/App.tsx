import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Drivers from "./pages/Drivers";
import Races from "./pages/Races";
import RaceEntry from "./pages/RaceEntry";
import Standings from "./pages/Standings";
import Stats from "./pages/Stats";   // ⭐ NEW PAGE
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/races" element={<Races />} />
          <Route path="/race/:raceId" element={<RaceEntry />} />
          <Route path="/standings" element={<Standings />} />

          {/* ⭐ NEW STATS PAGE */}
          <Route path="/stats" element={<Stats />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
