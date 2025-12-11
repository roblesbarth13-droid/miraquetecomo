import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, MapPin, Star } from "lucide-react";
import type { OfferWithBusiness } from "@shared/schema";
import { categoryDisplayNames } from "@shared/schema";

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

interface OfferCardProps {
  offer: OfferWithBusiness;
}

function BusinessRating({ businessId }: { businessId: string }) {
  const { data, isLoading } = useQuery<{ average: number; count: number }>({
    queryKey: ['/api/comercios', businessId, 'rating'],
    staleTime: 60000,
  });

  if (isLoading) return null;

  const avgNumber = typeof data?.average === 'number' ? data.average : Number(data?.average || 0);
  const hasRatings = data && data.count > 0;

  return (
    <div className="flex items-center gap-1 text-xs" data-testid={`rating-business-${businessId}`}>
      <Star className={`h-3 w-3 ${hasRatings ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
      {hasRatings ? (
        <>
          <span className="font-medium">{avgNumber.toFixed(1)}</span>
          <span className="text-muted-foreground">({data.count})</span>
        </>
      ) : (
        <span className="text-muted-foreground">Nuevo</span>
      )}
    </div>
  );
}

export function OfferCard({ offer }: OfferCardProps) {
  const originalPrice = parseFloat(offer.originalPrice);
  const discountedPrice = parseFloat(offer.discountedPrice);
  const quantityAvailable = (offer.quantity || 1) - (offer.quantitySold || 0);
  
  const displayImage = offer.imageUrl || categoryDefaultImages[offer.category];

  return (
    <Link href={`/oferta/${offer.id}`} data-testid={`card-offer-${offer.id}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 group shadow-md hover:shadow-lg border border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden">
          {displayImage ? (
            <img
              src={displayImage}
              alt={offer.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              data-testid={`img-offer-${offer.id}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">
                {categoryDisplayNames[offer.category]?.[0] || "?"}
              </span>
            </div>
          )}
          <Badge
            className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-md"
            data-testid={`badge-discount-${offer.id}`}
          >
            -{offer.discountPercentage}%
          </Badge>
        </div>
        <div className="p-2 space-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-semibold truncate flex-1" data-testid={`text-business-${offer.id}`}>
              {offer.business?.businessName || "Comercio"}
            </p>
            {offer.business?.id && <BusinessRating businessId={offer.business.id} />}
          </div>
          <h3 className="text-xs font-medium line-clamp-1 leading-tight" data-testid={`text-title-${offer.id}`}>
            {offer.title}
          </h3>
          <div className="flex items-baseline gap-1 pt-0.5">
            <span className="text-sm font-bold text-primary" data-testid={`text-price-${offer.id}`}>
              ${discountedPrice.toLocaleString('es-AR')}
            </span>
            <span className="text-[10px] line-through text-muted-foreground" data-testid={`text-original-price-${offer.id}`}>
              ${originalPrice.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground pt-0.5 flex-wrap">
            <div className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              <span data-testid={`text-pickup-${offer.id}`}>
                {offer.pickupTimeStart}-{offer.pickupTimeEnd}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Package className="h-2.5 w-2.5" />
              <span data-testid={`text-quantity-${offer.id}`}>
                {quantityAvailable}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
