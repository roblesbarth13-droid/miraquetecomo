import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, MapPin, Star, Flame, Sparkles } from "lucide-react";
import type { OfferWithBusiness } from "@shared/schema";
import { categoryDisplayNames } from "@shared/schema";

import panaderiaImg1 from "@/assets/images/category-panaderia.png";
import panaderiaImg2 from "@/assets/images/category-panaderia-2.png";
import panaderiaImg3 from "@/assets/images/category-panaderia-3.png";
import panaderiaImg4 from "@/assets/images/category-panaderia-4.png";

import verduleriaImg1 from "@/assets/images/category-verduleria.png";
import verduleriaImg2 from "@/assets/images/category-verduleria-2.png";
import verduleriaImg3 from "@/assets/images/category-verduleria-3.png";
import verduleriaImg4 from "@/assets/images/category-verduleria-4.png";

import supermercadoImg1 from "@/assets/images/category-supermercado.png";
import supermercadoImg2 from "@/assets/images/category-supermercado-2.png";
import supermercadoImg3 from "@/assets/images/category-supermercado-3.png";
import supermercadoImg4 from "@/assets/images/category-supermercado-4.png";

import rotiseriaImg1 from "@/assets/images/category-rotiseria.png";
import rotiseriaImg2 from "@/assets/images/category-rotiseria-2.png";
import rotiseriaImg3 from "@/assets/images/category-rotiseria-3.png";
import rotiseriaImg4 from "@/assets/images/category-rotiseria-4.png";

import carnicheriaImg1 from "@/assets/images/category-carniceria.png";
import carnicheriaImg2 from "@/assets/images/category-carniceria-2.png";
import carnicheriaImg3 from "@/assets/images/category-carniceria-3.png";
import carnicheriaImg4 from "@/assets/images/category-carniceria-4.png";

import restauranteImg1 from "@/assets/images/category-restaurante.png";
import restauranteImg2 from "@/assets/images/category-restaurante-2.png";
import restauranteImg3 from "@/assets/images/category-restaurante-3.png";
import restauranteImg4 from "@/assets/images/category-restaurante-4.png";

import cafeteriaImg1 from "@/assets/images/category-cafeteria.png";
import cafeteriaImg2 from "@/assets/images/category-cafeteria-2.png";
import cafeteriaImg3 from "@/assets/images/category-cafeteria-3.png";
import cafeteriaImg4 from "@/assets/images/category-cafeteria-4.png";

const categoryDefaultImages: Record<string, string[]> = {
  panaderia: [panaderiaImg1, panaderiaImg2, panaderiaImg3, panaderiaImg4],
  verduleria: [verduleriaImg1, verduleriaImg2, verduleriaImg3, verduleriaImg4],
  supermercado: [supermercadoImg1, supermercadoImg2, supermercadoImg3, supermercadoImg4],
  rotiseria: [rotiseriaImg1, rotiseriaImg2, rotiseriaImg3, rotiseriaImg4],
  carniceria: [carnicheriaImg1, carnicheriaImg2, carnicheriaImg3, carnicheriaImg4],
  restaurante: [restauranteImg1, restauranteImg2, restauranteImg3, restauranteImg4],
  cafeteria: [cafeteriaImg1, cafeteriaImg2, cafeteriaImg3, cafeteriaImg4],
};

function getDefaultImage(category: string, businessId: string | undefined): string | undefined {
  const images = categoryDefaultImages[category];
  if (!images || images.length === 0) return undefined;
  if (!businessId) return images[0];
  const hash = businessId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return images[hash % images.length];
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
    : (offer.business?.defaultOfferImage && offer.business.defaultOfferImage.trim() !== '')
      ? offer.business.defaultOfferImage
      : getDefaultImage(offer.category, offer.business?.id || offer.businessId);

  return (
    <Link href={`/oferta/${offer.id}`} data-testid={`card-offer-${offer.id}`}>
      <Card className={`overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 group shadow-md hover:shadow-lg border border-border/50 ${isNew ? 'ring-2 ring-primary/40 ring-offset-1' : ''}`}>
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
                className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5"
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
