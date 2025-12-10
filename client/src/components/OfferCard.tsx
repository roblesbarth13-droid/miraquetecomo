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
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 group">
        <div className="relative aspect-square overflow-hidden">
          {displayImage ? (
            <img
              src={displayImage}
              alt={offer.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              data-testid={`img-offer-${offer.id}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-3xl text-muted-foreground">
                {categoryDisplayNames[offer.category]?.[0] || "?"}
              </span>
            </div>
          )}
          <Badge
            className="absolute top-2 right-2 bg-accent text-accent-foreground text-sm font-bold px-3 py-1.5 rounded-full shadow-md"
            data-testid={`badge-discount-${offer.id}`}
          >
            -{offer.discountPercentage}%
          </Badge>
        </div>
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold truncate flex-1" data-testid={`text-business-${offer.id}`}>
              {offer.business?.businessName || "Comercio"}
            </p>
            {offer.business?.id && <BusinessRating businessId={offer.business.id} />}
          </div>
          {offer.business?.address && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate" data-testid={`text-address-${offer.id}`}>
                {offer.business.address}
              </span>
            </div>
          )}
          <h3 className="text-sm font-medium line-clamp-2 leading-tight" data-testid={`text-title-${offer.id}`}>
            {offer.title}
          </h3>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-lg font-bold text-primary" data-testid={`text-price-${offer.id}`}>
              ${discountedPrice.toLocaleString('es-AR')}
            </span>
            <span className="text-xs line-through text-muted-foreground" data-testid={`text-original-price-${offer.id}`}>
              ${originalPrice.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground pt-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span data-testid={`text-pickup-${offer.id}`}>
                {offer.pickupTimeStart} - {offer.pickupTimeEnd}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
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
