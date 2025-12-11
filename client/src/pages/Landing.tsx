import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ArrowRight, Store, Users, Percent, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Landing() {
  const { isAuthenticated, isBusiness } = useAuth();

  const getBusinessLink = () => {
    if (isBusiness) return "/comercio/ofertas/nueva";
    if (isAuthenticated) return "/convertir-comercio";
    return "/api/login";
  };

  const getUserLink = () => {
    if (isAuthenticated) return "/home";
    return "/api/login";
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-landing">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Logo size="md" />
          {isAuthenticated ? (
            <Button asChild data-testid="button-landing-home">
              <Link href="/home">Ver ofertas</Link>
            </Button>
          ) : (
            <Button asChild data-testid="button-landing-login">
              <a href="/api/login">Ingresar</a>
            </Button>
          )}
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Ahorrá hasta{" "}
                <span className="text-accent">70%</span> en comida de{" "}
                <span className="text-primary">comercios locales</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Conectamos panaderías, rotiserías, verdulerías y más con personas que quieren comprar comida de calidad a precios increíbles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg px-8" data-testid="button-start">
                  {getUserLink().startsWith('/api') ? (
                    <a href={getUserLink()}>
                      Empezar a ahorrar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  ) : (
                    <Link href={getUserLink()}>
                      Empezar a ahorrar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  )}
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8" data-testid="button-business">
                  {getBusinessLink().startsWith('/api') ? (
                    <a href={getBusinessLink()}>
                      <Store className="mr-2 h-5 w-5" />
                      Soy comercio
                    </a>
                  ) : (
                    <Link href={getBusinessLink()}>
                      <Store className="mr-2 h-5 w-5" />
                      Soy comercio
                    </Link>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              ¿Cómo funciona?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
              <Card className="text-center overflow-hidden">
                <div className="h-1 bg-primary" />
                <CardContent className="pt-4 md:pt-8 pb-4 md:pb-6 px-2 md:px-6 space-y-2 md:space-y-4">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
                    <Store className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="text-sm md:text-xl font-semibold">1. Explorá ofertas</h3>
                  <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
                    Navegá por las ofertas cerca tuyo y filtrá por categoría.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center overflow-hidden">
                <div className="h-1 bg-accent" />
                <CardContent className="pt-4 md:pt-8 pb-4 md:pb-6 px-2 md:px-6 space-y-2 md:space-y-4">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto">
                    <Percent className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                  </div>
                  <h3 className="text-sm md:text-xl font-semibold">2. Reservá y pagá</h3>
                  <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
                    Elegí tu oferta y pagá seguro con Mercado Pago.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center overflow-hidden col-span-2 md:col-span-1">
                <div className="h-1 bg-primary" />
                <CardContent className="pt-4 md:pt-8 pb-4 md:pb-6 px-2 md:px-6 space-y-2 md:space-y-4">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="text-sm md:text-xl font-semibold">3. Retirá tu pedido</h3>
                  <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
                    Pasá por el comercio en el horario indicado.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  ¿Tenés un comercio?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Reducí el desperdicio de comida y ganá dinero con los productos que te sobran cada día. Es gratis registrarte.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Publicá ofertas en minutos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Recibí pagos con Mercado Pago</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Llegá a nuevos clientes</span>
                  </li>
                </ul>
                <Button size="lg" asChild data-testid="button-become-business">
                  {getBusinessLink().startsWith('/api') ? (
                    <a href={getBusinessLink()}>
                      Registrar mi comercio
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  ) : (
                    <Link href={getBusinessLink()}>
                      Registrar mi comercio
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  )}
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 flex items-center justify-center">
                  <Store className="h-32 w-32 text-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Empezá a ahorrar hoy
            </h2>
            <p className="text-lg opacity-90">
              Únite a la comunidad que ahorra dinero y reduce el desperdicio de comida.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8" data-testid="button-join">
              {getUserLink().startsWith('/api') ? (
                <a href={getUserLink()}>
                  Crear cuenta gratis
                </a>
              ) : (
                <Link href={getUserLink()}>
                  Ver ofertas
                </Link>
              )}
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            2024 Mirá que te como. Reduciendo el desperdicio de comida.
          </p>
        </div>
      </footer>
    </div>
  );
}
