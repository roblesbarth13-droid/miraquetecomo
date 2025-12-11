import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { OfferCard } from "@/components/OfferCard";
import { OfferCardSkeleton } from "@/components/OfferCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Search, X } from "lucide-react";
import type { OfferWithBusiness } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, isBusiness } = useAuth();

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

      {!isBusiness && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="max-w-7xl mx-auto">
            <Button asChild variant="outline" className="w-full md:w-auto" data-testid="button-become-business-cta">
              <a href={isAuthenticated ? "/convertir-comercio" : "/api/login"}>
                <Store className="mr-2 h-4 w-4" />
                {isAuthenticated ? "¿Sos comercio? Cargá tu oferta acá" : "¿Sos comercio? Ingresá y cargá tu oferta"}
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
