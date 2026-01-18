import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CookieConsent } from "@/components/CookieConsent";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load heavy pages for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TourneeDetail = lazy(() => import("./pages/TourneeDetail"));
const SecuritySettings = lazy(() => import("./pages/SecuritySettings"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));

// Eagerly load light pages
import Auth from "./pages/Auth";
import Error404 from "./pages/Error404";
import Error500 from "./pages/Error500";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import CGV from "./pages/CGV";
import CGU from "./pages/CGU";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" />
      <p className="text-muted-foreground text-sm">Chargement...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GoogleAnalytics />
        <CookieConsent />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/subscribe" element={<Navigate to="/" replace />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/tournee/:tourneeId" element={
              <ProtectedRoute>
                <TourneeDetail />
              </ProtectedRoute>
            } />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/security" element={
              <ProtectedRoute>
                <SecuritySettings />
              </ProtectedRoute>
            } />
            <Route path="/error" element={<Error500 />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Error404 />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
