import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOfferSchema, updateBusinessProfileSchema } from "@shared/schema";

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

  // Simulated checkout (without real Mercado Pago integration)
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

      // Create purchase
      const purchase = await storage.createPurchase({
        offerId,
        userId,
      });

      // Simulate successful payment
      await storage.updatePurchaseStatus(purchase.id, 'pagado', `MP_${Date.now()}`);
      
      // Mark offer as sold
      await storage.updateOfferStatus(offerId, 'vendida');

      res.json({ 
        success: true, 
        message: "Compra realizada exitosamente",
        purchaseId: purchase.id,
      });
    } catch (error) {
      console.error("Error in checkout:", error);
      res.status(500).json({ message: "Error al procesar la compra" });
    }
  });

  return httpServer;
}
