import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Logo, ArgentinaStripes } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Notification } from "@shared/schema";
import { User, LogOut, Store, Package, MapPin, HelpCircle, QrCode, Bell, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, isAuthenticated, isBusiness } = useAuth();
  const [location, setLocation] = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.clear();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const { data: notificationCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notificaciones/count"],
    enabled: isBusiness,
    refetchInterval: 30000,
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notificaciones"],
    enabled: isBusiness && notifOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/notificaciones/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notificaciones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notificaciones/count"] });
    },
  });

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/home" data-testid="link-home">
            <Logo size="md" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/como-funciona">
            <Button variant="ghost" size="sm" className="hidden sm:flex" data-testid="button-how-it-works">
              <HelpCircle className="h-4 w-4 mr-1" />
              Cómo funciona
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" data-testid="button-how-it-works-mobile">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/mapa">
            <Button variant="ghost" size="sm" className="hidden sm:flex" data-testid="button-map">
              <MapPin className="h-4 w-4 mr-1" />
              Ofertas cerca tuyo
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" data-testid="button-map-mobile">
              <MapPin className="h-5 w-5" />
            </Button>
          </Link>
          {isBusiness && (
            <Popover open={notifOpen} onOpenChange={(open) => {
              setNotifOpen(open);
              if (open) {
                queryClient.invalidateQueries({ queryKey: ["/api/notificaciones"] });
              }
            }}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                  {(notificationCount?.count ?? 0) > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground"
                      data-testid="badge-notification-count"
                    >
                      {notificationCount!.count > 9 ? "9+" : notificationCount!.count}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0" data-testid="popover-notifications">
                <div className="p-3 border-b">
                  <h3 className="font-semibold text-sm">Notificaciones</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {!notifications || notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground" data-testid="text-no-notifications">No tenés notificaciones</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 p-3 border-b last:border-b-0 ${
                          !notif.read ? "bg-muted/50" : ""
                        }`}
                        data-testid={`notification-item-${notif.id}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium" data-testid={`text-notification-title-${notif.id}`}>{notif.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed" data-testid={`text-notification-message-${notif.id}`}>{notif.message}</p>
                          <p className="text-xs text-muted-foreground">{notif.createdAt ? formatTimeAgo(notif.createdAt.toString()) : ""}</p>
                        </div>
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              markReadMutation.mutate(notif.id);
                            }}
                            data-testid={`button-mark-read-${notif.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setNotifOpen(false);
                      setLocation("/comercio");
                    }}
                    data-testid="button-go-to-panel"
                  >
                    <Store className="h-4 w-4 mr-1" />
                    Ir al panel del comercio
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "Usuario"} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.firstName || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {isBusiness ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/comercio" className="flex items-center gap-2 cursor-pointer" data-testid="link-panel-comercio">
                        <Store className="h-4 w-4" />
                        Panel de comercio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/comercio/ofertas/nueva" className="flex items-center gap-2 cursor-pointer" data-testid="link-nueva-oferta">
                        <Package className="h-4 w-4" />
                        Nueva oferta
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/convertir-comercio" className="flex items-center gap-2 cursor-pointer" data-testid="link-convertir">
                      <Store className="h-4 w-4" />
                      Quiero ser comercio
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/mis-compras" className="flex items-center gap-2 cursor-pointer" data-testid="link-mis-compras">
                    <QrCode className="h-4 w-4" />
                    Mis compras
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-destructive" 
                  data-testid="link-logout"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex text-[#74ACDF] hover:text-[#5a9bcf] hover:bg-[#74ACDF]/10" data-testid="button-register-business-header">
                <a href="/registro-comercio">
                  <Store className="h-4 w-4 mr-1" />
                  Soy comercio
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" data-testid="button-register">
                <a href="/registro">
                  <span className="hidden sm:inline">Registrarse</span>
                  <span className="sm:hidden">Registro</span>
                </a>
              </Button>
              <Button asChild size="sm" data-testid="button-login">
                <a href="/login">
                  <User className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Ingresar</span>
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Franja argentina decorativa al fondo del header */}
      <div className="flex h-1" aria-label="Argentina">
        <div className="flex-1" style={{ backgroundColor: "#74ACDF" }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ backgroundColor: "#74ACDF" }} />
      </div>
    </header>
  );
}