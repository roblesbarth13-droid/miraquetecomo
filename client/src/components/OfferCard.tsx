import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import type { OfferWithBusiness } from "@shared/schema";
import { categoryDisplayNames } from "@shared/schema";

// Default category images
import panaderiaImg from "@assets/stock_images/artisan_bakery_bread_88577d89.jpg";
import verduleriaImg from "@assets/stock_images/fresh_vegetables_mar_abe5a0bf.jpg";
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

export function OfferCard({ offer }: OfferCardProps) {
  const originalPrice = parseFloat(offer.originalPrice);
  const discountedPrice = parseFloat(offer.discountedPrice);
  
  // Use uploaded image, or fall back to category default
  const displayImage = offer.imageUrl || categoryDefaultImages[offer.category];

  return (
    <Link href={`/oferta/${offer.id}`} data-testid={`card-offer-${offer.id}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 group">
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
              <span className="text-4xl text-muted-foreground">
                {categoryDisplayNames[offer.category]?.[0] || "?"}
              </span>
            </div>
          )}
          <Badge
            className="absolute top-3 right-3 bg-accent text-accent-foreground text-lg font-bold px-4 py-2 rounded-full"
            data-testid={`badge-discount-${offer.id}`}
          >
            -{offer.discountPercentage}%
          </Badge>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground" data-testid={`text-business-${offer.id}`}>
            {offer.business?.businessName || "Comercio"}
          </p>
          <h3 className="text-lg font-medium line-clamp-2" data-testid={`text-title-${offer.id}`}>
            {offer.title}
          </h3>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary" data-testid={`text-price-${offer.id}`}>
                ${discountedPrice.toLocaleString('es-AR')}
              </span>
              <span className="text-sm line-through text-muted-foreground" data-testid={`text-original-price-${offer.id}`}>
                ${originalPrice.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
            <Clock className="h-4 w-4" />
            <span data-testid={`text-pickup-${offer.id}`}>
              Retiro: {offer.pickupTimeStart} - {offer.pickupTimeEnd}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
