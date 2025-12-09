import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ArrowRight, Store, Users, Percent, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-landing">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Logo size="md" />
          <Button asChild data-testid="button-landing-login">
            <a href="/api/login">Ingresar</a>
          </Button>
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
                  <a href="/api/login">
                    Empezar a ahorrar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8" data-testid="button-business">
                  <a href="/api/login">
                    <Store className="mr-2 h-5 w-5" />
                    Soy comercio
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              ¿Cómo funciona?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">1. Explorá ofertas</h3>
                  <p className="text-muted-foreground">
                    Navegá por las ofertas disponibles cerca tuyo. Filtrá por categoría para encontrar lo que buscás.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <Percent className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold">2. Reservá y pagá</h3>
                  <p className="text-muted-foreground">
                    Elegí la oferta que más te guste y pagá de forma segura con Mercado Pago.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">3. Retirá tu pedido</h3>
                  <p className="text-muted-foreground">
                    Pasá por el comercio en el horario indicado y disfrutá de tu comida con descuento.
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
                  <a href="/api/login">
                    Registrar mi comercio
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
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
              <a href="/api/login">
                Crear cuenta gratis
              </a>
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
