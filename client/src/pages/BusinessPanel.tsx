import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { OfferCard } from "@/components/OfferCard";
import { OfferCardSkeleton } from "@/components/OfferCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Plus, Package, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { OfferWithBusiness, PurchaseWithOfferAndUser } from "@shared/schema";
import { statusDisplayNames, categoryDisplayNames } from "@shared/schema";

export default function BusinessPanel() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading, isBusiness } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acceso restringido",
        description: "Necesitás iniciar sesión para acceder.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    } else if (!authLoading && isAuthenticated && !isBusiness) {
      navigate("/convertir-comercio");
    }
  }, [authLoading, isAuthenticated, isBusiness, navigate, toast]);

  const { data: offers, isLoading: offersLoading } = useQuery<OfferWithBusiness[]>({
    queryKey: ["/api/comercio/ofertas"],
    enabled: isBusiness,
  });

  const { data: sales, isLoading: salesLoading } = useQuery<PurchaseWithOfferAndUser[]>({
    queryKey: ["/api/comercio/ventas"],
    enabled: isBusiness,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeOffers = offers?.filter((o) => o.status === "activa") || [];
  const soldOffers = offers?.filter((o) => o.status === "vendida") || [];
  const totalSales = sales?.filter((s) => s.paymentStatus === "pagado").length || 0;
  const totalRevenue = sales
    ?.filter((s) => s.paymentStatus === "pagado")
    .reduce((acc, s) => acc + parseFloat(s.offer?.discountedPrice || "0"), 0) || 0;

  return (
    <div className="min-h-screen bg-background" data-testid="page-business-panel">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-business-name-panel">
              {user?.businessName || "Mi comercio"}
            </h1>
            <p className="text-muted-foreground">
              Panel de administración de tu comercio
            </p>
          </div>
          <Button asChild data-testid="button-new-offer">
            <Link href="/comercio/ofertas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva oferta
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ofertas activas</p>
                  <p className="text-2xl font-bold" data-testid="stat-active-offers">
                    {offersLoading ? <Skeleton className="h-8 w-12" /> : activeOffers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ventas totales</p>
                  <p className="text-2xl font-bold" data-testid="stat-total-sales">
                    {salesLoading ? <Skeleton className="h-8 w-12" /> : totalSales}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos totales</p>
                  <p className="text-2xl font-bold" data-testid="stat-total-revenue">
                    {salesLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      `$${totalRevenue.toLocaleString('es-AR')}`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activas" className="space-y-6">
          <TabsList>
            <TabsTrigger value="activas" data-testid="tab-active">
              Activas ({activeOffers.length})
            </TabsTrigger>
            <TabsTrigger value="vendidas" data-testid="tab-sold">
              Vendidas ({soldOffers.length})
            </TabsTrigger>
            <TabsTrigger value="historial" data-testid="tab-history">
              Historial de ventas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activas">
            {offersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <OfferCardSkeleton key={i} />
                ))}
              </div>
            ) : activeOffers.length === 0 ? (
              <EmptyState type="no-business-offers" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="active-offers-grid">
                {activeOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vendidas">
            {offersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <OfferCardSkeleton key={i} />
                ))}
              </div>
            ) : soldOffers.length === 0 ? (
              <EmptyState type="no-sales" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="sold-offers-grid">
                {soldOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historial">
            {salesLoading ? (
              <Card>
                <CardContent className="p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : !sales || sales.length === 0 ? (
              <EmptyState type="no-sales" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de ventas</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y" data-testid="sales-history">
                    {sales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center gap-4 p-4 hover-elevate"
                        data-testid={`sale-${sale.id}`}
                      >
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {sale.offer?.imageUrl ? (
                            <img
                              src={sale.offer.imageUrl}
                              alt={sale.offer.title}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{sale.offer?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {sale.user?.firstName || sale.user?.email || "Usuario"}
                            {" - "}
                            {sale.createdAt
                              ? new Date(sale.createdAt).toLocaleDateString("es-AR")
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-semibold text-primary">
                            ${parseFloat(sale.offer?.discountedPrice || "0").toLocaleString('es-AR')}
                          </span>
                          <Badge
                            variant={sale.paymentStatus === "pagado" ? "default" : "secondary"}
                          >
                            {sale.paymentStatus === "pagado"
                              ? "Pagado"
                              : sale.paymentStatus === "pendiente"
                              ? "Pendiente"
                              : "Fallido"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
