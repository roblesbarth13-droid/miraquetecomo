import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { OfferCard } from "@/components/OfferCard";
import { OfferCardSkeleton } from "@/components/OfferCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { Plus, Package, DollarSign, TrendingUp, Loader2, Settings, MapPin, CreditCard, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { OfferWithBusiness, PurchaseWithOfferAndUser } from "@shared/schema";
import { statusDisplayNames, categoryDisplayNames } from "@shared/schema";

export default function BusinessPanel() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading, isBusiness } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    if (user) {
      setEditAddress(user.address || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { address: string; phone: string }) => {
      return apiRequest("PUT", "/api/comercio/perfil", {
        businessName: user?.businessName,
        category: user?.category,
        address: data.address,
        phone: data.phone,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu dirección fue geocodificada y ahora aparecerás en el mapa.",
      });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
    },
  });

  const { data: mpStatus, isLoading: mpStatusLoading } = useQuery<{
    connected: boolean;
    mpUserId: string | null;
    commission: number;
    oauthConfigured: boolean;
  }>({
    queryKey: ["/api/mercadopago/status"],
    enabled: isBusiness,
  });

  const connectMpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/mercadopago/oauth/url");
      return response.json();
    },
    onSuccess: (data: { url: string }) => {
      window.location.href = data.url;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo conectar con Mercado Pago.",
        variant: "destructive",
      });
    },
  });

  const disconnectMpMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/mercadopago/disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mercadopago/status"] });
      toast({
        title: "Mercado Pago desconectado",
        description: "Podés volver a conectarlo cuando quieras.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo desconectar Mercado Pago.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mp_connected") === "true") {
      toast({
        title: "Mercado Pago conectado",
        description: "Ahora recibirás los pagos directamente en tu cuenta.",
      });
      window.history.replaceState({}, "", "/comercio");
      queryClient.invalidateQueries({ queryKey: ["/api/mercadopago/status"] });
    } else if (params.get("mp_error")) {
      toast({
        title: "Error al conectar Mercado Pago",
        description: "No se pudo completar la autorización. Intentá de nuevo.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/comercio");
    }
  }, [toast]);

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
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Panel de administración de tu comercio</span>
              {user?.address && (
                <span className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3" />
                  {user.address}
                  {!user.latitude && (
                    <Badge variant="outline" className="text-xs ml-1">Sin ubicación</Badge>
                  )}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-edit-profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Editar perfil
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar perfil del comercio</DialogTitle>
                  <DialogDescription>
                    Actualizá tu dirección para aparecer en el mapa
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Dirección completa</Label>
                    <Input
                      id="edit-address"
                      placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      data-testid="input-edit-address"
                    />
                    <p className="text-xs text-muted-foreground">
                      Incluí calle, número, ciudad y provincia para mejor precisión en el mapa
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Teléfono (opcional)</Label>
                    <Input
                      id="edit-phone"
                      placeholder="Ej: 11-5555-1234"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      data-testid="input-edit-phone"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    data-testid="button-cancel-edit"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => updateProfileMutation.mutate({ address: editAddress, phone: editPhone })}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button asChild data-testid="button-new-offer">
              <Link href="/comercio/ofertas/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva oferta
              </Link>
            </Button>
          </div>
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Mercado Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mpStatusLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : mpStatus?.connected ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Cuenta conectada</p>
                    <p className="text-sm text-muted-foreground">
                      Recibís el {100 - (mpStatus?.commission || 25)}% de cada venta directamente en tu cuenta
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => disconnectMpMutation.mutate()}
                  disabled={disconnectMpMutation.isPending}
                  data-testid="button-disconnect-mp"
                >
                  {disconnectMpMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Desconectar"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium">Conectá tu cuenta de Mercado Pago</p>
                    <p className="text-sm text-muted-foreground">
                      Recibí el {100 - (mpStatus?.commission || 25)}% de cada venta directamente en tu cuenta
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => connectMpMutation.mutate()}
                  disabled={connectMpMutation.isPending || !mpStatus?.oauthConfigured}
                  data-testid="button-connect-mp"
                >
                  {connectMpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Conectar Mercado Pago
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
