import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="page-terms">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold mb-6" data-testid="text-terms-title">Términos y Condiciones</h1>
        
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar la plataforma "Mirá que te como" (en adelante, "la Plataforma"), 
                aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno 
                de estos términos, te pedimos que no utilices la Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. Descripción del Servicio</h2>
              <p>
                "Mirá que te como" es una plataforma digital que conecta comercios locales (panaderías, 
                verdulerías, carnicerías, rotiserías, supermercados y otros) que tienen excedentes de 
                alimentos con usuarios que desean adquirirlos a precios reducidos. La Plataforma actúa 
                como intermediaria, facilitando la conexión entre comercios y consumidores con el objetivo 
                de reducir el desperdicio de alimentos.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. Registro y Cuentas</h2>
              <p>
                Para utilizar ciertos servicios de la Plataforma, es necesario crear una cuenta proporcionando 
                información veraz y actualizada. Existen dos tipos de cuentas:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Usuario consumidor:</strong> Permite explorar y comprar ofertas publicadas por los comercios.</li>
                <li><strong>Cuenta comercio:</strong> Permite publicar ofertas de productos con descuento, gestionar ventas y recibir pagos.</li>
              </ul>
              <p className="mt-2">
                Sos responsable de mantener la confidencialidad de tu cuenta y contraseña, y de todas las 
                actividades que se realicen bajo tu cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Ofertas y Productos</h2>
              <p>
                Los comercios son los únicos responsables de la calidad, estado, descripción y disponibilidad 
                de los productos que publican. La Plataforma no inspecciona, verifica ni garantiza la calidad 
                de los productos ofrecidos. Cada oferta tiene un horario de retiro establecido por el comercio 
                y una cantidad limitada de unidades disponibles.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">5. Compras y Pagos</h2>
              <p>
                Las compras se realizan a través de Mercado Pago. Al completar una compra, se genera un 
                código único de retiro que el usuario debe presentar al comercio. El pago se divide entre 
                el comercio y la Plataforma según la comisión establecida. Los precios publicados incluyen 
                todos los cargos aplicables.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">6. Retiro de Productos</h2>
              <p>
                El usuario debe retirar los productos dentro del horario indicado en la oferta, presentando 
                el código QR o código alfanumérico generado al momento de la compra. La Plataforma no se 
                responsabiliza por productos no retirados dentro del plazo establecido.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">7. Calificaciones</h2>
              <p>
                Los usuarios pueden calificar a los comercios después de completar una compra. Las 
                calificaciones deben ser honestas y respetuosas. La Plataforma se reserva el derecho 
                de eliminar calificaciones que contengan contenido ofensivo, difamatorio o fraudulento.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">8. Responsabilidad</h2>
              <p>
                La Plataforma actúa exclusivamente como intermediaria entre comercios y consumidores. 
                No somos responsables de:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>La calidad, seguridad o legalidad de los productos ofrecidos.</li>
                <li>La veracidad de la información publicada por los comercios.</li>
                <li>El cumplimiento de las obligaciones por parte de comercios o usuarios.</li>
                <li>Daños directos o indirectos derivados del uso de la Plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">9. Propiedad Intelectual</h2>
              <p>
                Todo el contenido de la Plataforma (diseño, logotipos, textos, código) es propiedad de 
                "Mirá que te como" y está protegido por las leyes de propiedad intelectual. No se permite 
                la reproducción, distribución o modificación sin autorización previa.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">10. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. 
                Los cambios entrarán en vigencia desde su publicación en la Plataforma. El uso continuado 
                del servicio implica la aceptación de los términos modificados.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">11. Jurisdicción</h2>
              <p>
                Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Cualquier 
                controversia será sometida a la jurisdicción de los tribunales ordinarios de la ciudad de 
                Tres Arroyos, Provincia de Buenos Aires, Argentina.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">12. Contacto</h2>
              <p>
                Para consultas sobre estos Términos y Condiciones, podés comunicarte con nosotros a través de:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Email: roblesbarth13@gmail.com</li>
                <li>Teléfono: +54 2983 446464</li>
              </ul>
            </section>

            <p className="text-xs text-muted-foreground/70 pt-4 border-t">
              Última actualización: Marzo 2026
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
