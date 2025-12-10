import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Store, ShoppingCart, AlertCircle, Package } from "lucide-react";
import type { OfferWithBusiness } from "@shared/schema";
import { categoryDisplayNames, statusDisplayNames } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

import panaderiaImg from "@assets/stock_images/artisan_bakery_bread_88577d89.jpg";
import verduleriaImg from "@assets/generated_images/fresh_vegetables_close-up_shot.png";
import supermercadoImg from "@assets/stock_images/supermarket_grocery__3232780f.jpg";
import rotiseriaImg from "@assets/stock_images/rotisserie_chicken_g_2a292b03.jpg";
import carnicheriaImg from "@assets/stock_images/butcher_shop_fresh_m_a4f41153.jpg";

const categoryDefaultImages: Record<string, string> = {
  panaderia: panaderiaImg,
  verduleria: verduleriaImg,
  supermercado: supermercadoImg,
  rotiseria: rotiseriaImg,
  carniceria: carnicheriaImg,
};
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function OfferDetail() {
  const [match, params] = useRoute("/oferta/:id");
  const offerId = params?.id;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: offer, isLoading, error } = useQuery<OfferWithBusiness>({
    queryKey: ["/api/ofertas", offerId],
    queryFn: async () => {
      const res = await fetch(`/api/ofertas/${offerId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching offer");
      return res.json();
    },
    enabled: !!offerId,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/checkout", { offerId: Number(offerId) });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        toast({
          title: "Error",
          description: "No se pudo iniciar el proceso de pago.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Por favor, ingresá de nuevo.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo procesar la compra. Intentá de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    purchaseMutation.mutate();
  };

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-64 md:h-96 w-full rounded-2xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Oferta no encontrada</h1>
          <p className="text-muted-foreground mb-6">
            La oferta que buscás no existe o ya no está disponible.
          </p>
          <Button asChild>
            <Link href="/home">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const originalPrice = parseFloat(offer.originalPrice);
  const discountedPrice = parseFloat(offer.discountedPrice);
  const quantityAvailable = (offer.quantity || 1) - (offer.quantitySold || 0);
  const isSoldOut = quantityAvailable <= 0;
  const isAvailable = offer.status === "activa";

  return (
    <div className="min-h-screen bg-background" data-testid="page-offer-detail">
      <Header />

      <main className="pb-24">
        <div className="relative">
          <div className="aspect-[16/9] md:aspect-[21/9] max-h-96 overflow-hidden">
            <img
              src={offer.imageUrl || categoryDefaultImages[offer.category]}
              alt={offer.title}
              className="w-full h-full object-cover"
              data-testid="img-offer-detail"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <div className="absolute top-4 left-4">
            <Button
              variant="secondary"
              size="icon"
              asChild
              className="bg-background/80 backdrop-blur-sm"
              data-testid="button-back"
            >
              <Link href="/home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <Badge
            className="absolute top-4 right-4 bg-accent text-accent-foreground text-xl font-bold px-5 py-2 rounded-full"
            data-testid="badge-discount-detail"
          >
            -{offer.discountPercentage}%
          </Badge>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground" data-testid="text-business-name">
                      {offer.business?.businessName || "Comercio"}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryDisplayNames[offer.category]}
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-offer-title">
                    {offer.title}
                  </h1>
                </div>
                {!isAvailable && offer.status && (
                  <Badge variant="secondary" className="text-base">
                    {statusDisplayNames[offer.status]}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-offer-description">
                {offer.description}
              </p>

              <div className="flex items-center gap-4 flex-wrap text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-lg" data-testid="text-pickup-time">
                    Horario de retiro: {offer.pickupTimeStart} - {offer.pickupTimeEnd}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <span className="text-lg" data-testid="text-quantity-available">
                    {isSoldOut ? "Agotado" : `${quantityAvailable} disponible${quantityAvailable !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-4 py-4 border-t">
                <span className="text-4xl font-bold text-primary" data-testid="text-price-final">
                  ${discountedPrice.toLocaleString('es-AR')}
                </span>
                <span className="text-xl line-through text-muted-foreground" data-testid="text-price-original">
                  ${originalPrice.toLocaleString('es-AR')}
                </span>
                <span className="text-lg text-accent font-semibold">
                  Ahorrás ${(originalPrice - discountedPrice).toLocaleString('es-AR')}
                </span>
              </div>

              <Button
                size="lg"
                className="w-full md:w-auto text-lg px-8"
                onClick={handlePurchase}
                disabled={!isAvailable || isSoldOut || purchaseMutation.isPending}
                data-testid="button-purchase"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {purchaseMutation.isPending
                  ? "Procesando..."
                  : isSoldOut
                  ? "Agotado"
                  : isAvailable
                  ? "Comprar"
                  : "No disponible"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
