import { Link } from "wouter";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t mt-auto" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              Conectamos comercios con personas que quieren ahorrar y reducir el desperdicio de comida.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                data-testid="link-instagram"
              >
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                data-testid="link-facebook"
              >
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Para usuarios</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/home" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-offers">
                  Ver ofertas
                </Link>
              </li>
              <li>
                <Link href="/mapa" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-map">
                  Mapa de comercios
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-how">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/mis-compras" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-purchases">
                  Mis compras
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Para comercios</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/registro-comercio" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-register">
                  Registrar mi comercio
                </Link>
              </li>
              <li>
                <Link href="/comercio" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-panel">
                  Panel de comercio
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-benefits">
                  Beneficios
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:hola@miraquetecomo.com" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-email">
                  hola@miraquetecomo.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+54 11 1234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p data-testid="text-copyright">
            © {currentYear} Mirá que te como. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/terminos" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-terms">
              Términos y condiciones
            </Link>
            <Link href="/privacidad" className="hover-elevate inline-block rounded px-1 -mx-1" data-testid="link-footer-privacy">
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
