import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import CVUpload from "./pages/CVUpload";
import JobProfiles from "./pages/JobProfiles";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewInterface from "./pages/InterviewInterface";
import Feedback from "./pages/Feedback";
import Progression from "./pages/Progression";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cv-upload" element={<CVUpload />} />
            <Route path="/job-profiles" element={<JobProfiles />} />
            <Route path="/profile/:profileId" element={<InterviewSetup />} />
            <Route path="/interview/:profileId" element={<InterviewInterface />} />
            <Route path="/feedback/:profileId" element={<Feedback />} />
            <Route path="/progression" element={<Progression />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
