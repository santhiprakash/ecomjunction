
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import CookieConsent from "@/components/compliance/CookieConsent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MyProducts from "./pages/MyProducts";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import About from "./pages/About";
import Help from "./pages/Help";
import PrivacySettings from "./pages/PrivacySettings";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ProductProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/my-products" element={
                  <ProtectedRoute>
                    <MyProducts />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
                      <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/privacy-policy" element={<Privacy />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/privacy-settings" element={<PrivacySettings />} />
                <Route path="/terms-of-service" element={<Terms />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/features" element={<Features />} />
                <Route path="/about-us" element={<About />} />
                <Route path="/help-center" element={<Help />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieConsent />
            </BrowserRouter>
          </TooltipProvider>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
