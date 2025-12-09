import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ArrowLeft, Navigation } from "lucide-react";
import type { OfferWithBusiness } from "@shared/schema";
import { categoryDisplayNames } from "@shared/schema";

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferWithBusiness | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { data: offers, isLoading } = useQuery<OfferWithBusiness[]>({
    queryKey: ["/api/ofertas"],
  });

  const offersWithLocation = offers?.filter(
    (offer) => offer.business.latitude && offer.business.longitude
  ) || [];

  const loadGoogleMapsScript = useCallback(() => {
    if (window.google?.maps) {
      setIsMapLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsMapLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker&callback=initMap`;
    script.async = true;
    script.defer = true;
    window.initMap = () => setIsMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    loadGoogleMapsScript();
  }, [loadGoogleMapsScript]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log("Geolocation permission denied, using default center");
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.google?.maps) return;

    const center = userLocation || DEFAULT_CENTER;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        mapId: "DEMO_MAP_ID",
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    markersRef.current.forEach((marker) => (marker.map = null));
    markersRef.current = [];

    offersWithLocation.forEach((offer) => {
      if (!offer.business.latitude || !offer.business.longitude) return;

      const position = {
        lat: offer.business.latitude,
        lng: offer.business.longitude,
      };

      const markerContent = document.createElement('div');
      markerContent.className = 'marker-content';
      markerContent.innerHTML = `
        <div style="
          background: hsl(var(--primary));
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          white-space: nowrap;
        ">
          -${offer.discountPercentage}%
        </div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position,
        content: markerContent,
        title: offer.title,
      });

      marker.addListener('click', () => {
        setSelectedOffer(offer);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(position);
        }
      });

      markersRef.current.push(marker);
    });

    if (offersWithLocation.length > 0 && mapInstanceRef.current) {
      const bounds = new google.maps.LatLngBounds();
      offersWithLocation.forEach((offer) => {
        if (offer.business.latitude && offer.business.longitude) {
          bounds.extend({
            lat: offer.business.latitude,
            lng: offer.business.longitude,
          });
        }
      });
      if (userLocation) {
        bounds.extend(userLocation);
      }
      mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [isMapLoaded, offersWithLocation, userLocation]);

  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(userLocation);
      mapInstanceRef.current.setZoom(15);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="page-map">
      <Header />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Ofertas cerca tuyo</h1>
          {userLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={centerOnUser}
              data-testid="button-center-location"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Mi ubicación
            </Button>
          )}
          {!userLocation && <div className="w-24" />}
        </div>

        <div className="flex-1 relative">
          {!GOOGLE_MAPS_API_KEY ? (
            <div className="flex items-center justify-center h-full">
              <Card className="p-6 text-center max-w-md mx-4">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold mb-2">Mapa no disponible</h2>
                <p className="text-muted-foreground">
                  La API de Google Maps no está configurada. Contactá al administrador.
                </p>
              </Card>
            </div>
          ) : isLoading || !isMapLoaded ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-muted-foreground">
                Cargando mapa...
              </div>
            </div>
          ) : (
            <>
              <div ref={mapRef} className="w-full h-full min-h-[400px]" data-testid="google-map" />
              
              {selectedOffer && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10">
                  <Card className="overflow-hidden" data-testid="offer-mini-card">
                    <button
                      className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-1"
                      onClick={() => setSelectedOffer(null)}
                      data-testid="button-close-card"
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {selectedOffer.imageUrl && (
                      <div className="h-32 bg-muted">
                        <img
                          src={selectedOffer.imageUrl}
                          alt={selectedOffer.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold line-clamp-2">{selectedOffer.title}</h3>
                        <Badge variant="destructive" className="shrink-0">
                          -{selectedOffer.discountPercentage}%
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedOffer.business.businessName}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Badge variant="secondary">
                          {categoryDisplayNames[selectedOffer.category]}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedOffer.pickupTimeStart} - {selectedOffer.pickupTimeEnd}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-primary">
                            ${selectedOffer.discountedPrice}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            ${selectedOffer.originalPrice}
                          </span>
                        </div>
                        <Link href={`/oferta/${selectedOffer.id}`}>
                          <Button size="sm" data-testid="button-view-offer">
                            Ver oferta
                          </Button>
                        </Link>
                      </div>
                      
                      {selectedOffer.business.address && (
                        <div className="mt-3 pt-3 border-t flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{selectedOffer.business.address}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}
              
              {offersWithLocation.length === 0 && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Card className="p-6 text-center max-w-md mx-4 pointer-events-auto">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-lg font-semibold mb-2">No hay ofertas cercanas</h2>
                    <p className="text-muted-foreground">
                      No encontramos ofertas con ubicación disponible en este momento.
                    </p>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
