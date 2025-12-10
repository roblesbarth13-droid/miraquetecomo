import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Home, ShoppingBag, Clock, Store, AlertCircle, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PurchaseWithOffer {
  id: number;
  paymentStatus: string;
  offer?: {
    id: number;
    title: string;
    pickupTimeStart: string;
    pickupTimeEnd: string;
    businessId: string;
    business?: {
      id: string;
      businessName: string;
      address?: string;
    };
  };
}

function StarRating({ rating, onRate, disabled }: { rating: number; onRate: (stars: number) => void; disabled?: boolean }) {
  const [hovered, setHovered] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(0)}
          onClick={() => !disabled && onRate(star)}
          data-testid={`button-star-${star}`}
        >
          <Star
            className={`w-8 h-8 ${
              star <= (hovered || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const isSimulated = searchParams.get('simulated') === 'true';
  const purchaseId = searchParams.get('purchaseId');
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);

  const { data: purchase, isLoading } = useQuery<PurchaseWithOffer>({
    queryKey: ['/api/compras', purchaseId],
    queryFn: async () => {
      const res = await fetch(`/api/compras/${purchaseId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error fetching purchase');
      return res.json();
    },
    enabled: !!purchaseId,
  });

  const { data: ratingCheck } = useQuery<{ hasRated: boolean }>({
    queryKey: ['/api/calificaciones/check', purchaseId],
    enabled: !!purchaseId && purchase?.paymentStatus === 'pagado',
  });

  const submitRatingMutation = useMutation({
    mutationFn: async (data: { businessId: string; purchaseId: number; stars: number; comment?: string }) => {
      return apiRequest('/api/calificaciones', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Gracias por tu calificación",
        description: "Tu opinión ayuda a otros usuarios a elegir mejor.",
      });
      setHasSubmittedRating(true);
      queryClient.invalidateQueries({ queryKey: ['/api/calificaciones/check', purchaseId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "No se pudo enviar la calificación",
        variant: "destructive",
      });
    },
  });

  const handleSubmitRating = () => {
    if (!purchase?.offer?.business?.id || !purchaseId || rating === 0) return;
    
    submitRatingMutation.mutate({
      businessId: purchase.offer.business.id,
      purchaseId: parseInt(purchaseId),
      stars: rating,
      comment: comment.trim() || undefined,
    });
  };

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
  const canRate = purchase?.paymentStatus === 'pagado' && !ratingCheck?.hasRated && !hasSubmittedRating;

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
          
          {canRate && purchase?.offer?.business && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-4" data-testid="section-rating">
              <div>
                <h4 className="font-semibold mb-2">Calificá a {purchase.offer.business.businessName}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Tu opinión ayuda a otros usuarios
                </p>
              </div>
              
              <div className="flex justify-center">
                <StarRating 
                  rating={rating} 
                  onRate={setRating} 
                  disabled={submitRatingMutation.isPending}
                />
              </div>
              
              <Textarea
                placeholder="Contanos tu experiencia (opcional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                className="resize-none"
                disabled={submitRatingMutation.isPending}
                data-testid="input-rating-comment"
              />
              
              <Button
                onClick={handleSubmitRating}
                disabled={rating === 0 || submitRatingMutation.isPending}
                className="w-full"
                data-testid="button-submit-rating"
              >
                {submitRatingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar calificación"
                )}
              </Button>
            </div>
          )}
          
          {(ratingCheck?.hasRated || hasSubmittedRating) && (
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-green-700 dark:text-green-400">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-5 h-5" />
                <span>Ya calificaste esta compra</span>
              </div>
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
