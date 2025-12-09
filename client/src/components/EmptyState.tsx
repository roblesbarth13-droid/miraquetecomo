import { Package, SearchX, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface EmptyStateProps {
  type: "no-offers" | "no-results" | "no-business-offers" | "no-sales";
  onClearFilters?: () => void;
}

export function EmptyState({ type, onClearFilters }: EmptyStateProps) {
  const config = {
    "no-offers": {
      icon: Package,
      title: "No hay ofertas disponibles",
      description: "Por el momento no hay ofertas activas. Volvé pronto para encontrar increíbles descuentos.",
      action: null,
    },
    "no-results": {
      icon: SearchX,
      title: "Sin resultados",
      description: "No encontramos ofertas con esos filtros. Probá con otra categoría.",
      action: onClearFilters ? (
        <Button variant="outline" onClick={onClearFilters} data-testid="button-clear-filters">
          Limpiar filtros
        </Button>
      ) : null,
    },
    "no-business-offers": {
      icon: Store,
      title: "Sin ofertas activas",
      description: "Todavía no creaste ninguna oferta. Empezá a vender tus productos con descuento.",
      action: (
        <Button asChild data-testid="button-create-first-offer">
          <Link href="/comercio/ofertas/nueva">Crear mi primera oferta</Link>
        </Button>
      ),
    },
    "no-sales": {
      icon: Package,
      title: "Sin ventas aún",
      description: "Cuando vendas una oferta, la verás acá.",
      action: null,
    },
  };

  const { icon: Icon, title, description, action } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" data-testid="empty-state">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
