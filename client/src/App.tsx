import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScrapeDashboard from "./pages/ScrapeDashboard";
import TechnicalIntelligenceDashboard from "./pages/TechnicalIntelligenceDashboard";
import AIAnalysis from "./pages/AIAnalysis";
import Battlecard from "./pages/Battlecard";
import { NavBar } from "./components/NavBar";
import { ScrapeProvider } from "./state/ScrapeStore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrapeProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/scrape" element={<ScrapeDashboard />} />
            <Route path="/technical-intelligence" element={<TechnicalIntelligenceDashboard />} />
            <Route path="/analysis" element={<AIAnalysis />} />
            <Route path="/battlecards" element={<Battlecard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ScrapeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
