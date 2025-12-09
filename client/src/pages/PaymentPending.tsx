import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Home, ShoppingBag } from "lucide-react";

export default function PaymentPending() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-payment-pending-title">
            Pago Pendiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground" data-testid="text-payment-pending-message">
            Tu pago está siendo procesado. Esto puede tomar unos minutos dependiendo 
            del método de pago seleccionado.
          </p>
          <p className="text-sm text-muted-foreground">
            Te notificaremos por correo cuando el pago sea confirmado. 
            También podés verificar el estado en "Mis Compras".
          </p>
          
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => setLocation('/')}
              className="w-full"
              data-testid="button-go-home"
            >
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation('/mis-compras')}
              className="w-full"
              data-testid="button-view-purchases"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ver Mis Compras
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
