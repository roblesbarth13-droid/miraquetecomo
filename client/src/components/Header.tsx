import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Logo, ArgentinaStripes } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Store, Package, MapPin, HelpCircle, QrCode, Bell } from "lucide-react";

export function Header() {
  const { user, isAuthenticated, isBusiness } = useAuth();
  const [location] = useLocation();

  const { data: notificationCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notificaciones/count"],
    enabled: isBusiness,
    refetchInterval: 30000,
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

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/home" data-testid="link-home">
            <Logo size="md" />
          </Link>
          <ArgentinaStripes />
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
            <Link href="/comercio">
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
            </Link>
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
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="flex items-center gap-2 cursor-pointer text-destructive" data-testid="link-logout">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild data-testid="button-login">
              <a href="/api/login">
                <User className="h-4 w-4 mr-2" />
                Ingresar
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
