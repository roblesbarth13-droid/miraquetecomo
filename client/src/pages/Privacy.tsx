import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="page-privacy">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold mb-6" data-testid="text-privacy-title">Política de Privacidad</h1>
        
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Introducción</h2>
              <p>
                En "Plato Amigo" nos comprometemos a proteger tu privacidad. Esta Política de Privacidad 
                describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando 
                utilizás nuestra plataforma. Al usar nuestros servicios, aceptás las prácticas descritas en 
                esta política.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. Información que Recopilamos</h2>
              <p>Recopilamos la siguiente información:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Datos de registro:</strong> Nombre, apellido, dirección de correo electrónico y contraseña.</li>
                <li><strong>Datos de comercios:</strong> Nombre del comercio, dirección, teléfono, categoría, CBU/alias de Mercado Pago para recibir pagos.</li>
                <li><strong>Datos de transacciones:</strong> Historial de compras, montos, estados de pago, códigos de retiro.</li>
                <li><strong>Datos de ubicación:</strong> Dirección del comercio para mostrar en el mapa (geocodificación).</li>
                <li><strong>Datos de uso:</strong> Interacciones con la plataforma, calificaciones y comentarios.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. Cómo Usamos tu Información</h2>
              <p>Utilizamos tu información para:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Crear y gestionar tu cuenta en la plataforma.</li>
                <li>Procesar compras y pagos a través de Mercado Pago.</li>
                <li>Generar códigos de retiro y verificar entregas.</li>
                <li>Mostrar la ubicación de los comercios en el mapa.</li>
                <li>Enviar notificaciones relacionadas con tus compras o ventas.</li>
                <li>Generar estadísticas agregadas sobre el impacto ambiental (CO₂ evitado, alimentos salvados).</li>
                <li>Mejorar la experiencia de uso de la plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Almacenamiento y Seguridad</h2>
              <p>
                Tu información se almacena en servidores seguros. Las contraseñas se encriptan mediante 
                algoritmos de hash (bcrypt) y nunca se almacenan en texto plano. Las sesiones se gestionan 
                de forma segura con tokens cifrados. Implementamos medidas de protección contra accesos no 
                autorizados, incluyendo limitación de solicitudes (rate limiting) para prevenir abusos.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">5. Compartición de Datos</h2>
              <p>No vendemos ni alquilamos tu información personal. Compartimos datos únicamente en los siguientes casos:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Mercado Pago:</strong> Para procesar los pagos de las compras. Mercado Pago tiene su propia política de privacidad.</li>
                <li><strong>Google Maps:</strong> Las direcciones de los comercios se envían a Google Maps para obtener las coordenadas geográficas.</li>
                <li><strong>Entre usuarios y comercios:</strong> Se comparte la información necesaria para completar la transacción (código de retiro, nombre del comercio).</li>
                <li><strong>Requerimiento legal:</strong> Cuando sea exigido por ley o autoridad judicial competente.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">6. Tus Derechos</h2>
              <p>De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina, tenés derecho a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Acceso:</strong> Solicitar información sobre los datos personales que tenemos sobre vos.</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
                <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos personales.</li>
                <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos en determinadas circunstancias.</li>
              </ul>
              <p className="mt-2">
                Para ejercer estos derechos, contactanos a roblesbarth13@gmail.com.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">7. Cookies y Tecnologías Similares</h2>
              <p>
                Utilizamos cookies de sesión para mantener tu sesión activa mientras usás la plataforma. 
                Estas cookies son esenciales para el funcionamiento del servicio y se eliminan al cerrar 
                la sesión. No utilizamos cookies de rastreo ni de publicidad de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">8. Menores de Edad</h2>
              <p>
                La Plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente 
                información de menores. Si detectamos que un menor ha proporcionado datos personales, 
                procederemos a eliminarlos.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">9. Cambios en esta Política</h2>
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre 
                cambios significativos a través de la plataforma. Te recomendamos revisar esta página 
                regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">10. Contacto</h2>
              <p>
                Si tenés preguntas sobre esta Política de Privacidad o sobre el tratamiento de tus datos 
                personales, contactanos:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Email: roblesbarth13@gmail.com</li>
                <li>Teléfono: +54 2983 446464</li>
                <li>Dirección: Tres Arroyos, Buenos Aires, Argentina</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">11. Autoridad de Control</h2>
              <p>
                La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control de la 
                Ley 25.326 de Protección de Datos Personales en Argentina. Podés presentar una denuncia 
                ante este organismo si considerás que tus derechos han sido vulnerados.
              </p>
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
