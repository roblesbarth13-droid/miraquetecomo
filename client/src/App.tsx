import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Splash from "@/pages/Splash";
import Home from "@/pages/Home";
import OfferDetail from "@/pages/OfferDetail";
import CreateOffer from "@/pages/CreateOffer";
import BusinessPanel from "@/pages/BusinessPanel";
import ConvertToBusiness from "@/pages/ConvertToBusiness";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailure from "@/pages/PaymentFailure";
import PaymentPending from "@/pages/PaymentPending";
import MapView from "@/pages/MapView";
import HowItWorks from "@/pages/HowItWorks";
import MisCompras from "@/pages/MisCompras";
import RegisterBusiness from "@/pages/RegisterBusiness";
import RegisterUser from "@/pages/RegisterUser";
import Login from "@/pages/Login";
import VerificarQR from "@/pages/VerificarQR";

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
      {/* Splash screen */}
      <Route path="/" component={Splash} />
      
      {/* Public routes - accessible to everyone */}
      <Route path="/home" component={Home} />
      <Route path="/mapa" component={MapView} />
      <Route path="/como-funciona" component={HowItWorks} />
      <Route path="/oferta/:id" component={OfferDetail} />
      <Route path="/landing" component={Landing} />
      <Route path="/registro-comercio" component={RegisterBusiness} />
      <Route path="/registro" component={RegisterUser} />
      <Route path="/login" component={Login} />
      
      {/* QR verification route */}
      <Route path="/verificar/:code" component={VerificarQR} />
      
      {/* Payment result routes */}
      <Route path="/pago/exito" component={PaymentSuccess} />
      <Route path="/pago/fallo" component={PaymentFailure} />
      <Route path="/pago/pendiente" component={PaymentPending} />
      
      {/* User purchases */}
      <Route path="/mis-compras" component={MisCompras} />
      
      {/* Auth-required route - page handles its own auth guard */}
      <Route path="/convertir-comercio" component={ConvertToBusiness} />
      
      {/* Business-only routes - pages handle their own auth guards */}
      <Route path="/comercio" component={BusinessPanel} />
      <Route path="/comercio/ofertas/nueva" component={CreateOffer} />
      
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
