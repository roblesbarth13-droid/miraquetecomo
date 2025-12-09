import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import OfferDetail from "@/pages/OfferDetail";
import CreateOffer from "@/pages/CreateOffer";
import BusinessPanel from "@/pages/BusinessPanel";
import ConvertToBusiness from "@/pages/ConvertToBusiness";

function Router() {
  const { isAuthenticated, isLoading, isBusiness } = useAuth();

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/" component={Home} />
      <Route path="/oferta/:id" component={OfferDetail} />
      <Route path="/landing" component={Landing} />
      
      {/* Auth-required route - page handles its own auth guard */}
      <Route path="/convertir-comercio" component={ConvertToBusiness} />
      
      {/* Business-only routes */}
      {isAuthenticated && isBusiness && (
        <>
          <Route path="/comercio" component={BusinessPanel} />
          <Route path="/comercio/ofertas/nueva" component={CreateOffer} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
