import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { OfferCard } from "@/components/OfferCard";
import { OfferCardSkeleton } from "@/components/OfferCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import type { OfferWithBusiness } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <Header />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-7xl mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        ) : !offers || offers.length === 0 ? (
          <EmptyState
            type={selectedCategory ? "no-results" : "no-offers"}
            onClearFilters={() => setSelectedCategory(null)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="offers-grid">
            {offers.map((offer) => (
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
