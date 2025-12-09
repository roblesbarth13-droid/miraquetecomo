import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Home, ShoppingBag, Clock, Store, AlertCircle } from "lucide-react";

interface PurchaseWithOffer {
  id: number;
  paymentStatus: string;
  offer?: {
    title: string;
    pickupTimeStart: string;
    pickupTimeEnd: string;
    business?: {
      businessName: string;
      address?: string;
    };
  };
}

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const isSimulated = searchParams.get('simulated') === 'true';
  const purchaseId = searchParams.get('purchaseId');

  const { data: purchase, isLoading } = useQuery<PurchaseWithOffer>({
    queryKey: ['/api/compras', purchaseId],
    queryFn: async () => {
      const res = await fetch(`/api/compras/${purchaseId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error fetching purchase');
      return res.json();
    },
    enabled: !!purchaseId,
  });

  if (isLoading && purchaseId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPending = purchase?.paymentStatus === 'pendiente';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            {isPending ? (
              <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            )}
          </div>
          <CardTitle className="text-2xl" data-testid="text-payment-success-title">
            {isPending ? 'Pago en Proceso' : 'Compra Exitosa'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground" data-testid="text-payment-success-message">
            {isPending 
              ? 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'
              : 'Tu pago ha sido procesado correctamente.'
            }
            {isSimulated && " (Pago simulado para demostración)"}
          </p>
          
          {purchase?.offer && (
            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
              <h3 className="font-semibold" data-testid="text-offer-title">{purchase.offer.title}</h3>
              {purchase.offer.business && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Store className="w-4 h-4" />
                  <span data-testid="text-business-name">{purchase.offer.business.businessName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span data-testid="text-pickup-time">
                  Retiro: {purchase.offer.pickupTimeStart} - {purchase.offer.pickupTimeEnd}
                </span>
              </div>
              {purchase.offer.business?.address && (
                <p className="text-sm text-muted-foreground" data-testid="text-address">
                  {purchase.offer.business.address}
                </p>
              )}
            </div>
          )}
          
          {!purchase && !purchaseId && (
            <div className="flex items-center gap-2 justify-center text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>No pudimos obtener los detalles de tu compra.</span>
            </div>
          )}
          
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
              onClick={() => setLocation('/')}
              className="w-full"
              data-testid="button-view-offers"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ver Más Ofertas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
