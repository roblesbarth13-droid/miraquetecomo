import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryFilter } from "@/components/CategoryFilter";
import { OfferCard } from "@/components/OfferCard";
import { OfferCardSkeleton } from "@/components/OfferCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Store, Search, X, QrCode, ShoppingBag } from "lucide-react";
import type { OfferWithBusiness, PurchaseWithOfferAndUser } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const { isAuthenticated, isBusiness } = useAuth();

  const { data: pendingPurchases } = useQuery<PurchaseWithOfferAndUser[]>({
    queryKey: ["/api/mis-compras"],
    enabled: isAuthenticated && !isBusiness,
    select: (data) => data.filter((p) => p.paymentStatus === "pagado" && !p.pickedUp),
  });

  const { data: qrData, isLoading: qrLoading } = useQuery<{ qrCode: string; pickupCode: string; pickedUp: string | null }>({
    queryKey: ["/api/compras", selectedPurchaseId, "qr"],
    enabled: !!selectedPurchaseId,
  });

  const { data: offers, isLoading } = useQuery<OfferWithBusiness[]>({
    queryKey: ["/api/ofertas", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/ofertas?category=${selectedCategory}` 
        : "/api/ofertas";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching offers");
      return res.json();
    },
  });

  const filteredOffers = useMemo(() => {
    if (!offers || !searchQuery.trim()) return offers;
    const query = searchQuery.toLowerCase().trim();
    return offers.filter(offer => 
      offer.title.toLowerCase().includes(query) ||
      offer.description.toLowerCase().includes(query) ||
      offer.business?.businessName?.toLowerCase().includes(query) ||
      offer.business?.address?.toLowerCase().includes(query)
    );
  }, [offers, searchQuery]);

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <Header />

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ofertas, comercios o zonas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            data-testid="input-search"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {pendingPurchases && pendingPurchases.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-4" data-testid="pending-pickups-banner">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">
                {pendingPurchases.length === 1
                  ? "Tenés 1 retiro pendiente"
                  : `Tenés ${pendingPurchases.length} retiros pendientes`}
              </p>
            </div>
            <div className="space-y-2 pl-8">
              {pendingPurchases.map((purchase) => (
                <button
                  key={purchase.id}
                  onClick={() => setSelectedPurchaseId(purchase.id)}
                  className="w-full flex items-center justify-between gap-2 rounded-md p-2 text-left hover-elevate"
                  data-testid={`button-pending-pickup-${purchase.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{purchase.offer.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {purchase.offer.business?.businessName}
                      {purchase.offer.business?.address && ` - ${purchase.offer.business.address}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-primary flex-shrink-0">
                    <QrCode className="h-4 w-4" />
                    <span className="text-xs font-medium">Ver QR</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="py-4">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-24 pt-2">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        ) : !filteredOffers || filteredOffers.length === 0 ? (
          <EmptyState
            type={selectedCategory || searchQuery ? "no-results" : "no-offers"}
            onClearFilters={() => {
              setSelectedCategory(null);
              setSearchQuery("");
            }}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3" data-testid="offers-grid">
            {filteredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {!isBusiness && (
        <div className="fixed bottom-0 left-0 right-0 shadow-lg z-50">
          <div className="flex flex-col">
            <div className="h-2 bg-[#74ACDF]" />
            <div className="bg-white py-2">
              <div className="max-w-7xl mx-auto px-4">
                <a 
                  href="/registro-comercio"
                  className="flex items-center justify-center gap-2 text-gray-800 font-semibold text-sm"
                  data-testid="button-become-business-cta"
                >
                  <Store className="h-4 w-4 text-[#74ACDF]" />
                  <span>¿Sos comercio? Registrate y cargá tu oferta</span>
                </a>
              </div>
            </div>
            <div className="h-2 bg-[#74ACDF]" />
          </div>
        </div>
      )}

      <Dialog open={!!selectedPurchaseId} onOpenChange={(open) => !open && setSelectedPurchaseId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Codigo de Retiro</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrLoading ? (
              <Skeleton className="h-64 w-64" />
            ) : qrData ? (
              <>
                <img
                  src={qrData.qrCode}
                  alt="Codigo QR"
                  className="w-64 h-64 mb-4"
                  data-testid="img-home-qr-code"
                />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Mostra este codigo en el comercio
                  </p>
                  <p className="text-3xl font-mono font-bold tracking-widest" data-testid="text-home-qr-pickup-code">
                    {qrData.pickupCode}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Error al cargar el codigo QR</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
