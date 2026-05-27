import { Link } from "wouter";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t mt-auto py-4 pb-20" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <p data-testid="text-copyright">
              © {currentYear} Plato Amigo
            </p>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                data-testid="link-instagram"
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                data-testid="link-facebook"
              >
                <Facebook className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
            <a 
              href="mailto:roblesbarth13@gmail.com" 
              className="hover-elevate inline-flex items-center gap-1 rounded px-1"
              data-testid="link-footer-email"
            >
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">roblesbarth13@gmail.com</span>
            </a>
            <a 
              href="tel:+542983446464" 
              className="hover-elevate inline-flex items-center gap-1 rounded px-1"
              data-testid="link-footer-phone"
            >
              <Phone className="h-3 w-3" />
              <span>2983 446464</span>
            </a>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>Tres Arroyos</span>
            </span>
          </div>

          <div className="flex gap-4 text-xs">
            <Link href="/terminos" className="hover-elevate rounded px-1" data-testid="link-footer-terms">
              Términos
            </Link>
            <Link href="/privacidad" className="hover-elevate rounded px-1" data-testid="link-footer-privacy">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
