import type { Express } from "express";
import { type Server } from "http";
import path from "path";
import fs from "fs";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOfferSchema, updateBusinessProfileSchema } from "@shared/schema";
import { createPaymentPreference, getPaymentDetails, isMercadoPagoConfigured } from "./mercadopago";

// Geocoding function using Google Maps API
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.log("GOOGLE_MAPS_API_KEY not configured, skipping geocoding");
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address + ", Argentina");
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`Geocoded "${address}" to: ${location.lat}, ${location.lng}`);
      return { lat: location.lat, lng: location.lng };
    } else {
      console.log(`Geocoding failed for "${address}": ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

// Configure multer for image uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'offer-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Usá JPG, PNG, WebP o GIF.'));
    }
  }
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);

  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "Imagen no encontrada" });
    }
  });

  // Image upload endpoint
  app.post('/api/upload', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se subió ninguna imagen" });
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ success: true, imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Error al subir la imagen" });
    }
  });

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

      // Set expiration to 24 hours from now
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const oferta = await storage.createOffer({
        ...validation.data,
        businessId: userId,
        expiresAt,
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

      // Geocode address if provided
      let coordinates: { lat: number; lng: number } | null = null;
      if (validation.data.address) {
        coordinates = await geocodeAddress(validation.data.address);
      }

      const dataWithCoordinates = {
        ...validation.data,
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null,
      };

      const user = await storage.updateUserToBusiness(userId, dataWithCoordinates);
      res.json(user);
    } catch (error) {
      console.error("Error converting to business:", error);
      res.status(500).json({ message: "Error al convertir a comercio" });
    }
  });

  // Update business profile (for existing businesses)
  app.put('/api/comercio/perfil', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'comercio') {
        return res.status(403).json({ message: "Solo comercios pueden actualizar su perfil" });
      }

      const validation = updateBusinessProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Datos inválidos", errors: validation.error.errors });
      }

      // Geocode address if provided
      let coordinates: { lat: number; lng: number } | null = null;
      if (validation.data.address) {
        coordinates = await geocodeAddress(validation.data.address);
      }

      const dataWithCoordinates = {
        ...validation.data,
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null,
      };

      const updatedUser = await storage.updateUserToBusiness(userId, dataWithCoordinates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating business profile:", error);
      res.status(500).json({ message: "Error al actualizar perfil" });
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

      // Check if there's stock available
      const quantityAvailable = (oferta.quantity || 1) - (oferta.quantitySold || 0);
      if (quantityAvailable <= 0) {
        return res.status(400).json({ message: "Esta oferta se agotó" });
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
      await storage.incrementOfferQuantitySold(purchase.offerId);

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
            await storage.incrementOfferQuantitySold(purchase.offerId);
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
