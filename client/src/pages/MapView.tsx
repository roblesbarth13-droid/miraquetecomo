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

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferWithBusiness | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const { data: offers, isLoading } = useQuery<OfferWithBusiness[]>({
    queryKey: ["/api/ofertas"],
  });

  const { data: config } = useQuery<{ googleMapsApiKey: string }>({
    queryKey: ["/api/config"],
  });

  useEffect(() => {
    if (config?.googleMapsApiKey) {
      setApiKey(config.googleMapsApiKey);
    }
  }, [config]);

  const offersWithLocation = offers?.filter(
    (offer) => offer.business.latitude && offer.business.longitude
  ) || [];

  const loadGoogleMapsScript = useCallback(() => {
    if (!apiKey) return;
    
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setMapError("Error al cargar Google Maps. Verificá tu conexión a internet.");
    };
    window.initMap = () => setIsMapLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (apiKey) {
      loadGoogleMapsScript();
    }
  }, [apiKey, loadGoogleMapsScript]);

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

    try {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: 14,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
      }

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      offersWithLocation.forEach((offer) => {
        if (!offer.business.latitude || !offer.business.longitude) return;

        const position = {
          lat: offer.business.latitude,
          lng: offer.business.longitude,
        };

        const categoryShort: Record<string, string> = {
          panaderia: 'Pan',
          verduleria: 'Verd',
          carniceria: 'Carn',
          rotiseria: 'Roti',
          supermercado: 'Super',
        };
        const categoryColors: Record<string, { bg: string; border: string }> = {
          panaderia: { bg: '#d97706', border: '#b45309' },
          verduleria: { bg: '#16a34a', border: '#15803d' },
          carniceria: { bg: '#dc2626', border: '#b91c1c' },
          rotiseria: { bg: '#ca8a04', border: '#a16207' },
          supermercado: { bg: '#2563eb', border: '#1d4ed8' },
        };
        const catLabel = categoryShort[offer.category] || offer.category.slice(0, 4);
        const colors = categoryColors[offer.category] || { bg: '#16a34a', border: '#15803d' };
        const discountText = `-${offer.discountPercentage}%`;
        
        const svgMarker = `
          <svg xmlns="http://www.w3.org/2000/svg" width="70" height="36" viewBox="0 0 70 36">
            <rect x="0" y="0" width="70" height="28" rx="4" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1"/>
            <polygon points="35,28 30,36 40,36" fill="${colors.bg}"/>
            <text x="35" y="12" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="Arial">${catLabel}</text>
            <text x="35" y="23" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="Arial">${discountText}</text>
          </svg>
        `;
        const encodedSvg = encodeURIComponent(svgMarker);

        const marker = new google.maps.Marker({
          map: mapInstanceRef.current,
          position,
          title: `${offer.title} - ${categoryDisplayNames[offer.category]} - $${offer.discountedPrice}`,
          icon: {
            url: `data:image/svg+xml,${encodedSvg}`,
            scaledSize: new google.maps.Size(70, 36),
            anchor: new google.maps.Point(35, 36),
          },
        });

        marker.addListener('click', () => {
          setSelectedOffer(offer);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo(position);
          }
        });

        markersRef.current.push(marker);
      });

      if (userLocation) {
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }
        userMarkerRef.current = new google.maps.Marker({
          map: mapInstanceRef.current,
          position: userLocation,
          title: "Tu ubicación",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
          zIndex: 1000,
        });
      }

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
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Error al inicializar el mapa.");
    }
  }, [isMapLoaded, offersWithLocation, userLocation]);

  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(userLocation);
      mapInstanceRef.current.setZoom(15);
    }
  };

  const isApiKeyMissing = config && !config.googleMapsApiKey;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden" data-testid="page-map">
      <Header />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b flex items-center justify-between gap-4 shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.history.back()}
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
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

        <div className="flex-1 relative min-h-0">
          {isApiKeyMissing ? (
            <div className="flex items-center justify-center h-full">
              <Card className="p-6 text-center max-w-md mx-4">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold mb-2">Mapa no disponible</h2>
                <p className="text-muted-foreground">
                  La API de Google Maps no está configurada. Contactá al administrador.
                </p>
              </Card>
            </div>
          ) : mapError ? (
            <div className="flex items-center justify-center h-full">
              <Card className="p-6 text-center max-w-md mx-4">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold mb-2">Error en el mapa</h2>
                <p className="text-muted-foreground">{mapError}</p>
              </Card>
            </div>
          ) : isLoading || !isMapLoaded || !apiKey ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-muted-foreground">
                Cargando mapa...
              </div>
            </div>
          ) : (
            <>
              <div ref={mapRef} className="absolute inset-0" data-testid="google-map" />
              
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
