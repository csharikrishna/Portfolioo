import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import CommandPalette from "@/components/ui-custom/CommandPalette";
import BackToTopButton from "@/components/ui-custom/BackToTopButton";
import ScrollProgressBar from "@/components/ui-custom/ScrollProgressBar";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index.tsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const AppLoadingFallback = () => (
  <div className="loading-shell px-6 py-20">
    <div className="max-w-[1100px] mx-auto">
      <div className="loading-shimmer h-6 w-40 mb-8" />
      <div className="loading-shimmer h-20 w-full max-w-[760px] mb-6" />
      <div className="loading-shimmer h-4 w-full max-w-[620px] mb-3" />
      <div className="loading-shimmer h-4 w-full max-w-[540px] mb-14" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="loading-shimmer h-44" />
        <div className="loading-shimmer h-44" />
      </div>
    </div>
  </div>
);

const App = () => (
  <TooltipProvider>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollProgressBar />
        <CommandPalette />
        <BackToTopButton />
        <Toaster />
        <Sonner />
        <Suspense fallback={<AppLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </TooltipProvider>
);

export default App;
