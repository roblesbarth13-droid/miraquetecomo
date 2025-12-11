import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Search, 
  MousePointer, 
  CreditCard, 
  ShoppingBag, 
  UserPlus, 
  MapPin, 
  PlusCircle, 
  Banknote,
  Leaf,
  PiggyBank,
  Recycle,
  Heart,
  TrendingDown,
  Store,
  Utensils
} from "lucide-react";

const userSteps = [
  {
    icon: Search,
    title: "Buscá tu oferta",
    description: "Explorá las ofertas disponibles cerca tuyo. Filtrá por categoría: panaderías, verdulerías, carnicerías y más."
  },
  {
    icon: MousePointer,
    title: "Elegí lo que te gusta",
    description: "Revisá los detalles, el descuento, el horario de retiro y la ubicación del comercio."
  },
  {
    icon: CreditCard,
    title: "Pagá de forma segura",
    description: "Realizá el pago online a través de Mercado Pago de manera rápida y segura."
  },
  {
    icon: ShoppingBag,
    title: "Retirá tu pedido",
    description: "Acercate al comercio en el horario indicado, mostrá tu comprobante y llevate tu comida."
  }
];

const businessSteps = [
  {
    icon: UserPlus,
    title: "Registrate como comercio",
    description: "Creá tu cuenta y convertí tu perfil en cuenta comercial en pocos minutos."
  },
  {
    icon: MapPin,
    title: "Completá tu información",
    description: "Agregá tu dirección, teléfono y datos para que los clientes te encuentren fácilmente."
  },
  {
    icon: PlusCircle,
    title: "Creá tus ofertas",
    description: "Publicá la comida que te sobra con el descuento que quieras ofrecer y el horario de retiro."
  },
  {
    icon: Banknote,
    title: "Vendé y cobrá",
    description: "Recibí el pago automáticamente. Menos desperdicio, más ingresos para tu negocio."
  }
];

const benefits = [
  {
    icon: PiggyBank,
    title: "Ahorrá hasta 70%",
    description: "Conseguí comida de calidad a una fracción del precio original.",
    color: "text-green-600 dark:text-green-400"
  },
  {
    icon: Leaf,
    title: "Cuidá el planeta",
    description: "Cada compra evita que comida perfecta termine en la basura.",
    color: "text-emerald-600 dark:text-emerald-400"
  },
  {
    icon: Heart,
    title: "Apoyá comercios locales",
    description: "Ayudás a negocios de tu barrio a reducir pérdidas y crecer.",
    color: "text-rose-600 dark:text-rose-400"
  },
  {
    icon: Recycle,
    title: "Economía circular",
    description: "Formá parte de un sistema más sustentable y consciente.",
    color: "text-teal-600 dark:text-teal-400"
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-how-it-works">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-16">
        <section className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            <Leaf className="w-4 h-4 mr-1 inline" />
            Reducí el desperdicio, ahorrá dinero
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold">
            Mirá cómo funciona
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una forma simple de rescatar comida deliciosa que de otra manera se desperdiciaría. 
            Bueno para vos, bueno para el planeta.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center p-6">
              <CardContent className="p-0 space-y-3">
                <div className={`mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center ${benefit.color}`}>
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-lg">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-primary">
              <Utensils className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wider">Para usuarios</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Conseguí comida increíble en 4 pasos
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {userSteps.map((step, index) => (
              <Card key={index} className="h-full overflow-hidden">
                <div className="h-1 bg-primary" />
                <CardContent className="p-3 md:p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:text-lg flex-shrink-0">
                      {index + 1}
                    </div>
                    <step.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-lg leading-tight">{step.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" data-testid="button-explore-offers">
              <Link href="/home">
                <Search className="mr-2 h-5 w-5" />
                Explorar ofertas
              </Link>
            </Button>
          </div>
        </section>

        <div className="border-t" />

        <section className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-accent-foreground">
              <Store className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wider">Para comercios</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Vendé lo que de otra forma tirarías
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Convertí el excedente de comida en ingresos extra. Sin complicaciones.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {businessSteps.map((step, index) => (
              <Card key={index} className="h-full overflow-hidden">
                <div className="h-1 bg-accent" />
                <CardContent className="p-3 md:p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm md:text-lg flex-shrink-0">
                      {index + 1}
                    </div>
                    <step.icon className="w-5 h-5 md:w-6 md:h-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-lg leading-tight">{step.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="secondary" data-testid="button-register-business">
              <Link href="/convertir-comercio">
                <Store className="mr-2 h-5 w-5" />
                Registrar mi comercio
              </Link>
            </Button>
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20">
            <TrendingDown className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Juntos reducimos el desperdicio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En Argentina se desperdician <strong>16 millones de toneladas de comida</strong> por año. 
            Cada oferta que rescatás es un paso hacia un futuro más sustentable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" data-testid="button-start-saving">
              <Link href="/home">
                <PiggyBank className="mr-2 h-5 w-5" />
                Empezar a ahorrar
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" data-testid="button-join-business">
              <Link href="/convertir-comercio">
                <Leaf className="mr-2 h-5 w-5" />
                Sumar mi comercio
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
