import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, MapPin, Star, Flame, Sparkles } from "lucide-react";
import type { OfferWithBusiness } from "@shared/schema";
import { categoryDisplayNames } from "@shared/schema";

import panaderiaImg1 from "@assets/stock_images/artisan_bakery_bread_88577d89.jpg";
import panaderiaImg2 from "@assets/stock_images/artisan_bakery_fresh_ed0a1418.jpg";
import panaderiaImg3 from "@assets/stock_images/artisan_bakery_fresh_59da5186.jpg";
import panaderiaImg4 from "@assets/stock_images/artisan_bakery_fresh_315fbdae.jpg";

import verduleriaImg1 from "@assets/generated_images/fresh_vegetables_close-up_shot.png";
import verduleriaImg2 from "@assets/stock_images/fresh_vegetables_pro_7ff67616.jpg";
import verduleriaImg3 from "@assets/stock_images/fresh_vegetables_pro_7535dd22.jpg";
import verduleriaImg4 from "@assets/stock_images/fresh_vegetables_pro_c3e5218f.jpg";

import supermercadoImg1 from "@assets/stock_images/supermarket_grocery__3232780f.jpg";
import supermercadoImg2 from "@assets/stock_images/supermarket_grocery__28ff4c56.jpg";
import supermercadoImg3 from "@assets/stock_images/supermarket_grocery__ec9d428d.jpg";
import supermercadoImg4 from "@assets/stock_images/supermarket_grocery__3f448503.jpg";

import rotiseriaImg1 from "@assets/stock_images/rotisserie_grilled_c_cf907a9d.jpg";
import rotiseriaImg2 from "@assets/stock_images/rotisserie_grilled_c_c1705c2f.jpg";
import rotiseriaImg3 from "@assets/stock_images/delicious_prepared_f_ac55d082.jpg";
import rotiseriaImg4 from "@assets/stock_images/delicious_prepared_f_8b6b41f5.jpg";

import carnicheriaImg1 from "@assets/stock_images/butcher_shop_fresh_m_a4f41153.jpg";
import carnicheriaImg2 from "@assets/stock_images/butcher_shop_fresh_m_2c42e0b0.jpg";
import carnicheriaImg3 from "@assets/stock_images/butcher_shop_fresh_m_fcdafb88.jpg";
import carnicheriaImg4 from "@assets/stock_images/butcher_shop_fresh_m_5c03fbee.jpg";

const categoryDefaultImages: Record<string, string[]> = {
  panaderia: [panaderiaImg1, panaderiaImg2, panaderiaImg3, panaderiaImg4],
  verduleria: [verduleriaImg1, verduleriaImg2, verduleriaImg3, verduleriaImg4],
  supermercado: [supermercadoImg1, supermercadoImg2, supermercadoImg3, supermercadoImg4],
  rotiseria: [rotiseriaImg1, rotiseriaImg2, rotiseriaImg3, rotiseriaImg4],
  carniceria: [carnicheriaImg1, carnicheriaImg2, carnicheriaImg3, carnicheriaImg4],
};

function getDefaultImage(category: string, offerId: number): string | undefined {
  const images = categoryDefaultImages[category];
  if (!images || images.length === 0) return undefined;
  return images[offerId % images.length];
}

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
  const isLowStock = quantityAvailable <= 3 && quantityAvailable > 0;
  const isNew = offer.createdAt && (Date.now() - new Date(offer.createdAt).getTime()) < 24 * 60 * 60 * 1000;
  
  const displayImage = (offer.imageUrl && offer.imageUrl.trim() !== '') 
    ? offer.imageUrl 
    : getDefaultImage(offer.category, offer.id);

  return (
    <Link href={`/oferta/${offer.id}`} data-testid={`card-offer-${offer.id}`}>
      <Card className={`overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 group shadow-md hover:shadow-lg border border-border/50 ${isNew ? 'ring-2 ring-primary/40 ring-offset-1 animate-[pulse_3s_ease-in-out_infinite]' : ''}`}>
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
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {isNew && (
              <Badge
                className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5"
                data-testid={`badge-new-${offer.id}`}
              >
                <Sparkles className="h-2.5 w-2.5" />
                Nuevo
              </Badge>
            )}
            {isLowStock && (
              <Badge
                className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5 animate-pulse"
                data-testid={`badge-low-stock-${offer.id}`}
              >
                <Flame className="h-2.5 w-2.5" />
                {quantityAvailable === 1 ? 'Último!' : `Quedan ${quantityAvailable}`}
              </Badge>
            )}
          </div>
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
