import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/Logo";
import { ArrowLeft, QrCode, CheckCircle, Clock, Package, Store, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PurchaseWithOfferAndUser } from "@shared/schema";

export default function MisCompras() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedPurchase, setSelectedPurchase] = useState<number | null>(null);

  const { data: compras, isLoading } = useQuery<PurchaseWithOfferAndUser[]>({
    queryKey: ['/api/mis-compras'],
    enabled: isAuthenticated,
  });

  const { data: qrData, isLoading: qrLoading } = useQuery<{ qrCode: string; pickupCode: string; pickedUp: string | null }>({
    queryKey: ['/api/compras', selectedPurchase, 'qr'],
    enabled: !!selectedPurchase,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <Logo size="sm" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Iniciá sesión para ver tus compras</h2>
              <p className="text-muted-foreground mb-6">
                Necesitás estar logueado para ver tus compras y códigos QR.
              </p>
              <Button asChild>
                <a href="/api/login">Iniciar sesión</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const paidPurchases = compras?.filter(c => c.paymentStatus === 'pagado') || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/home">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6" data-testid="text-title">Mis Compras</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paidPurchases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No tenés compras todavía</h2>
              <p className="text-muted-foreground mb-6">
                Cuando compres una oferta, acá vas a ver tu código QR para retirar.
              </p>
              <Button asChild>
                <Link href="/home">Ver ofertas</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paidPurchases.map(compra => (
              <Card 
                key={compra.id} 
                className="overflow-hidden"
                data-testid={`card-purchase-${compra.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {compra.pickedUp ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Retirado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendiente de retiro
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold truncate" data-testid={`text-offer-title-${compra.id}`}>
                        {compra.offer.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Store className="h-3 w-3" />
                        <span>{compra.offer.business.businessName}</span>
                      </div>
                      
                      {compra.offer.business.address && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{compra.offer.business.address}</span>
                        </div>
                      )}
                      
                      <div className="mt-2 text-lg font-bold text-primary">
                        ${parseFloat(compra.offer.discountedPrice).toLocaleString('es-AR')}
                      </div>
                      
                      {compra.pickupCode && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Código: </span>
                          <span className="font-mono font-bold" data-testid={`text-pickup-code-${compra.id}`}>
                            {compra.pickupCode}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!compra.pickedUp && (
                      <Button 
                        onClick={() => setSelectedPurchase(compra.id)}
                        className="flex-shrink-0"
                        data-testid={`button-show-qr-${compra.id}`}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Ver QR
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!selectedPurchase} onOpenChange={(open) => !open && setSelectedPurchase(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Código de Retiro</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrLoading ? (
              <Skeleton className="h-64 w-64" />
            ) : qrData ? (
              <>
                <img 
                  src={qrData.qrCode} 
                  alt="Código QR" 
                  className="w-64 h-64 mb-4"
                  data-testid="img-qr-code"
                />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Mostrá este código en el comercio
                  </p>
                  <p className="text-3xl font-mono font-bold tracking-widest" data-testid="text-qr-pickup-code">
                    {qrData.pickupCode}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Error al cargar el código QR</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
