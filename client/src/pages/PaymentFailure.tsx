import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Home, RefreshCw } from "lucide-react";

export default function PaymentFailure() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-payment-failure-title">
            Pago No Procesado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground" data-testid="text-payment-failure-message">
            No pudimos procesar tu pago. Esto puede deberse a fondos insuficientes, 
            datos incorrectos o un problema temporal.
          </p>
          <p className="text-sm text-muted-foreground">
            No se ha realizado ningún cargo a tu cuenta. Podés intentar nuevamente o elegir otra oferta.
          </p>
          
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => window.history.back()}
              className="w-full"
              data-testid="button-retry-payment"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Intentar Nuevamente
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation('/')}
              className="w-full"
              data-testid="button-go-home"
            >
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
