import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOfferSchema, updateBusinessProfileSchema } from "@shared/schema";
import { createPaymentPreference, getPaymentDetails, isMercadoPagoConfigured } from "./mercadopago";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error al obtener usuario" });
    }
  });

  // Get all offers (with optional category filter)
  app.get('/api/ofertas', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const ofertas = await storage.getOffers(category);
      res.json(ofertas);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Error al obtener ofertas" });
    }
  });

  // Get single offer by ID
  app.get('/api/ofertas/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      const oferta = await storage.getOfferById(id);
      if (!oferta) {
        return res.status(404).json({ message: "Oferta no encontrada" });
      }
      res.json(oferta);
    } catch (error) {
      console.error("Error fetching offer:", error);
      res.status(500).json({ message: "Error al obtener oferta" });
    }
  });

  // Create new offer (business only)
  app.post('/api/ofertas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'comercio') {
        return res.status(403).json({ message: "Solo los comercios pueden crear ofertas" });
      }

      const validation = insertOfferSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Datos inválidos", errors: validation.error.errors });
      }

      const oferta = await storage.createOffer({
        ...validation.data,
        businessId: userId,
      });
      res.status(201).json(oferta);
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ message: "Error al crear oferta" });
    }
  });

  // Get business offers
  app.get('/api/comercio/ofertas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'comercio') {
        return res.status(403).json({ message: "Solo los comercios pueden acceder a este recurso" });
      }

      const ofertas = await storage.getOffersByBusinessId(userId);
      res.json(ofertas);
    } catch (error) {
      console.error("Error fetching business offers:", error);
      res.status(500).json({ message: "Error al obtener ofertas del comercio" });
    }
  });

  // Get business sales
  app.get('/api/comercio/ventas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'comercio') {
        return res.status(403).json({ message: "Solo los comercios pueden acceder a este recurso" });
      }

      const ventas = await storage.getPurchasesByBusinessId(userId);
      res.json(ventas);
    } catch (error) {
      console.error("Error fetching business sales:", error);
      res.status(500).json({ message: "Error al obtener ventas del comercio" });
    }
  });

  // Get purchase status (for payment result pages)
  app.get('/api/compras/:id', isAuthenticated, async (req: any, res) => {
    try {
      const purchaseId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (isNaN(purchaseId)) {
        return res.status(400).json({ message: "ID de compra inválido" });
      }
      
      const purchase = await storage.getPurchaseById(purchaseId);
      if (!purchase) {
        return res.status(404).json({ message: "Compra no encontrada" });
      }
      
      // Verify the purchase belongs to the authenticated user
      if (purchase.userId !== userId) {
        return res.status(403).json({ message: "No tenés acceso a esta compra" });
      }
      
      // Get offer details
      const offer = await storage.getOfferById(purchase.offerId);
      
      res.json({
        ...purchase,
        offer: offer,
      });
    } catch (error) {
      console.error("Error fetching purchase:", error);
      res.status(500).json({ message: "Error al obtener compra" });
    }
  });

  // Convert user to business
  app.post('/api/perfil/convertir-comercio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validation = updateBusinessProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Datos inválidos", errors: validation.error.errors });
      }

      const user = await storage.updateUserToBusiness(userId, validation.data);
      res.json(user);
    } catch (error) {
      console.error("Error converting to business:", error);
      res.status(500).json({ message: "Error al convertir a comercio" });
    }
  });

  // Create checkout preference with Mercado Pago
  app.post('/api/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { offerId } = req.body;

      if (!offerId) {
        return res.status(400).json({ message: "ID de oferta requerido" });
      }

      const oferta = await storage.getOfferById(offerId);
      if (!oferta) {
        return res.status(404).json({ message: "Oferta no encontrada" });
      }

      if (oferta.status !== 'activa') {
        return res.status(400).json({ message: "Esta oferta ya no está disponible" });
      }

      const user = await storage.getUser(userId);
      
      // Create purchase with pending status
      const purchase = await storage.createPurchase({
        offerId,
        userId,
      });

      // Create Mercado Pago preference
      const preference = await createPaymentPreference({
        offerId: oferta.id,
        title: oferta.title,
        description: `${oferta.title} - ${oferta.business.businessName}`,
        price: parseFloat(oferta.discountedPrice),
        buyerEmail: user?.email || undefined,
        purchaseId: purchase.id,
      });

      res.json({ 
        success: true,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
        purchaseId: purchase.id,
        isSimulated: !isMercadoPagoConfigured(),
      });
    } catch (error) {
      console.error("Error in checkout:", error);
      res.status(500).json({ message: "Error al procesar la compra" });
    }
  });

  // Simulated payment completion (when MP is not configured)
  app.get('/api/checkout/simulate', isAuthenticated, async (req: any, res) => {
    try {
      const purchaseId = parseInt(req.query.purchaseId as string);
      
      if (isNaN(purchaseId)) {
        return res.status(400).json({ message: "ID de compra inválido" });
      }

      const purchase = await storage.getPurchaseById(purchaseId);
      if (!purchase) {
        return res.status(404).json({ message: "Compra no encontrada" });
      }

      // Simulate successful payment
      await storage.updatePurchaseStatus(purchaseId, 'pagado', `SIM_${Date.now()}`);
      await storage.updateOfferStatus(purchase.offerId, 'vendida');

      res.redirect(`/pago/exito?purchaseId=${purchaseId}&simulated=true`);
    } catch (error) {
      console.error("Error in simulated checkout:", error);
      res.redirect('/pago/fallo');
    }
  });

  // Mercado Pago webhook
  app.post('/api/webhook/mercadopago', async (req, res) => {
    try {
      const { type, data } = req.body;
      
      // Respond quickly to MP
      res.status(200).send('OK');
      
      if (type === 'payment') {
        const paymentId = data.id;
        const paymentData = await getPaymentDetails(paymentId);
        
        const purchaseId = parseInt(paymentData.external_reference);
        
        if (paymentData.status === 'approved') {
          const purchase = await storage.getPurchaseById(purchaseId);
          if (purchase) {
            await storage.updatePurchaseStatus(purchaseId, 'pagado', paymentId);
            await storage.updateOfferStatus(purchase.offerId, 'vendida');
          }
        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          await storage.updatePurchaseStatus(purchaseId, 'fallido', paymentId);
        }
      }
    } catch (error) {
      console.error("Webhook error:", error);
    }
  });

  return httpServer;
}
