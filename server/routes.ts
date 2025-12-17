import type { Express } from "express";
import { type Server } from "http";
import path from "path";
import fs from "fs";
import multer from "multer";
import QRCode from "qrcode";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOfferSchema, updateBusinessProfileSchema, insertRatingSchema } from "@shared/schema";
import { 
  createPaymentPreference, 
  getPaymentDetails, 
  isMercadoPagoConfigured,
  getOAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  isOAuthConfigured,
  getCommissionPercent,
} from "./mercadopago";

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

  // Public config endpoint for frontend (maps API key)
  app.get('/api/config', (req, res) => {
    res.json({
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });
  });

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

  // Get user's purchases with QR codes
  app.get('/api/mis-compras', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const compras = await storage.getPurchasesByUserId(userId);
      res.json(compras);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
      res.status(500).json({ message: "Error al obtener compras" });
    }
  });

  // Generate QR code for a purchase
  app.get('/api/compras/:id/qr', isAuthenticated, async (req: any, res) => {
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
      
      if (purchase.userId !== userId) {
        return res.status(403).json({ message: "No tenés acceso a esta compra" });
      }
      
      if (purchase.paymentStatus !== 'pagado') {
        return res.status(400).json({ message: "El pago de esta compra no fue completado" });
      }
      
      // Generate pickup code if missing (for legacy purchases)
      let pickupCode = purchase.pickupCode;
      if (!pickupCode) {
        const updatedPurchase = await storage.ensurePickupCode(purchaseId);
        if (updatedPurchase) {
          pickupCode = updatedPurchase.pickupCode;
        }
      }
      
      if (!pickupCode) {
        return res.status(400).json({ message: "Error al generar código de retiro" });
      }
      
      const qrDataUrl = await QRCode.toDataURL(pickupCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      res.json({ 
        qrCode: qrDataUrl, 
        pickupCode: pickupCode,
        pickedUp: purchase.pickedUp
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Error al generar código QR" });
    }
  });

  // Verify pickup code (for businesses)
  app.get('/api/comercio/verificar/:code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'comercio') {
        return res.status(403).json({ message: "Solo comercios pueden verificar códigos" });
      }
      
      const code = req.params.code.toUpperCase();
      const purchase = await storage.getPurchaseByPickupCode(code);
      
      if (!purchase) {
        return res.status(404).json({ message: "Código no encontrado", valid: false });
      }
      
      // Verify this purchase is for this business's offer
      if (purchase.offer.businessId !== userId) {
        return res.status(403).json({ message: "Este código no corresponde a tu comercio", valid: false });
      }
      
      if (purchase.paymentStatus !== 'pagado') {
        return res.status(400).json({ message: "El pago no fue completado", valid: false });
      }
      
      res.json({
        valid: true,
        purchase: {
          id: purchase.id,
          pickupCode: purchase.pickupCode,
          pickedUp: purchase.pickedUp,
          offer: {
            title: purchase.offer.title,
            discountedPrice: purchase.offer.discountedPrice,
          },
          user: {
            firstName: purchase.user.firstName,
            lastName: purchase.user.lastName,
          },
          createdAt: purchase.createdAt,
        }
      });
    } catch (error) {
      console.error("Error verifying pickup code:", error);
      res.status(500).json({ message: "Error al verificar código" });
    }
  });

  // Mark purchase as picked up (for businesses)
  app.post('/api/comercio/retirar/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchaseId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'comercio') {
        return res.status(403).json({ message: "Solo comercios pueden marcar retiros" });
      }
      
      if (isNaN(purchaseId)) {
        return res.status(400).json({ message: "ID de compra inválido" });
      }
      
      const purchase = await storage.getPurchaseById(purchaseId);
      if (!purchase) {
        return res.status(404).json({ message: "Compra no encontrada" });
      }
      
      // Verify this purchase is for this business's offer
      const offer = await storage.getOfferById(purchase.offerId);
      if (!offer || offer.businessId !== userId) {
        return res.status(403).json({ message: "Esta compra no corresponde a tu comercio" });
      }
      
      if (purchase.pickedUp) {
        return res.status(400).json({ message: "Este pedido ya fue retirado" });
      }
      
      const updatedPurchase = await storage.markPurchaseAsPickedUp(purchaseId);
      res.json({ success: true, purchase: updatedPurchase });
    } catch (error) {
      console.error("Error marking pickup:", error);
      res.status(500).json({ message: "Error al marcar retiro" });
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

      // Check if seller has connected Mercado Pago for split payments
      let sellerAccessToken = oferta.business.mpAccessToken || undefined;
      const tokenExpiresAt = oferta.business.mpTokenExpiresAt;
      const refreshToken = oferta.business.mpRefreshToken;
      let usingSplit = !!sellerAccessToken;
      
      // Check if token is expired and needs refresh
      if (sellerAccessToken && tokenExpiresAt && refreshToken) {
        const now = new Date();
        const expiryDate = new Date(tokenExpiresAt);
        const bufferMinutes = 10; // Refresh 10 min before expiry
        
        if (now >= new Date(expiryDate.getTime() - bufferMinutes * 60 * 1000)) {
          console.log(`Token expired/expiring for seller ${oferta.business.id}, refreshing...`);
          try {
            const tokenResponse = await refreshAccessToken(refreshToken);
            const newExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
            
            // Update tokens in database
            await storage.updateUserMpTokens(oferta.business.id, {
              mpAccessToken: tokenResponse.access_token,
              mpRefreshToken: tokenResponse.refresh_token,
              mpUserId: tokenResponse.user_id.toString(),
              mpTokenExpiresAt: newExpiresAt,
            });
            
            sellerAccessToken = tokenResponse.access_token;
            console.log(`Token refreshed for seller ${oferta.business.id}`);
          } catch (refreshError) {
            console.error("Failed to refresh seller token:", refreshError);
            // Fall back to platform payment with warning
            sellerAccessToken = undefined;
            usingSplit = false;
            console.warn("Split payment disabled due to token refresh failure");
          }
        }
      }

      // Create Mercado Pago preference (with split if seller connected)
      const preference = await createPaymentPreference({
        offerId: oferta.id,
        title: oferta.title,
        description: `${oferta.title} - ${oferta.business.businessName}`,
        price: parseFloat(oferta.discountedPrice),
        buyerEmail: user?.email || undefined,
        purchaseId: purchase.id,
        sellerAccessToken,
      });

      if (usingSplit) {
        console.log(`Split payment created for offer ${oferta.id}, seller: ${oferta.business.mpUserId}`);
      } else if (oferta.business.mpAccessToken) {
        console.warn(`Split payment fallback for offer ${oferta.id} - token issues`);
      }

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

  // ===== RATINGS ROUTES =====
  
  // Create a rating for a business (after purchase)
  app.post('/api/calificaciones', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { businessId, purchaseId, stars, comment } = req.body;
      
      // Validate with schema
      const validatedData = insertRatingSchema.parse({
        businessId,
        userId,
        purchaseId,
        stars,
        comment,
      });
      
      // Check if user has already rated this purchase
      const hasRated = await storage.hasUserRatedPurchase(userId, purchaseId);
      if (hasRated) {
        return res.status(400).json({ message: "Ya calificaste esta compra" });
      }
      
      // Verify the purchase belongs to this user and is paid
      const purchase = await storage.getPurchaseById(purchaseId);
      if (!purchase) {
        return res.status(404).json({ message: "Compra no encontrada" });
      }
      if (purchase.userId !== userId) {
        return res.status(403).json({ message: "No podés calificar una compra que no es tuya" });
      }
      if (purchase.paymentStatus !== 'pagado') {
        return res.status(400).json({ message: "Solo podés calificar compras pagadas" });
      }
      
      const rating = await storage.createRating(validatedData);
      res.json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(500).json({ message: "Error al crear la calificación" });
    }
  });
  
  // Get ratings for a business
  app.get('/api/comercios/:businessId/calificaciones', async (req, res) => {
    try {
      const { businessId } = req.params;
      const ratings = await storage.getRatingsByBusinessId(businessId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Error al obtener calificaciones" });
    }
  });
  
  // Get average rating for a business
  app.get('/api/comercios/:businessId/rating', async (req, res) => {
    try {
      const { businessId } = req.params;
      const rating = await storage.getBusinessAverageRating(businessId);
      res.json(rating);
    } catch (error) {
      console.error("Error fetching business rating:", error);
      res.status(500).json({ message: "Error al obtener rating del comercio" });
    }
  });
  
  // Check if user can rate a purchase
  app.get('/api/calificaciones/check/:purchaseId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchaseId = parseInt(req.params.purchaseId);
      
      if (isNaN(purchaseId)) {
        return res.status(400).json({ message: "ID de compra inválido" });
      }
      
      const hasRated = await storage.hasUserRatedPurchase(userId, purchaseId);
      res.json({ hasRated });
    } catch (error) {
      console.error("Error checking rating:", error);
      res.status(500).json({ message: "Error al verificar calificación" });
    }
  });

  // ===== MERCADO PAGO OAUTH ROUTES =====

  // Get OAuth URL for connecting merchant's Mercado Pago account
  app.get('/api/mercadopago/oauth/url', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'comercio') {
        return res.status(403).json({ message: "Solo comercios pueden conectar Mercado Pago" });
      }

      if (!isOAuthConfigured()) {
        return res.status(500).json({ message: "Mercado Pago OAuth no está configurado" });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : 'http://localhost:5000';
      
      const redirectUri = `${baseUrl}/api/mercadopago/oauth/callback`;
      
      // Generate CSRF-safe state token by combining userId with a random value
      const csrfToken = Math.random().toString(36).substring(2, 15);
      const state = `${userId}:${csrfToken}`;
      
      // Store the state in session for validation
      req.session.mpOAuthState = state;
      
      const oauthUrl = getOAuthUrl(redirectUri, state);
      
      res.json({ url: oauthUrl, redirectUri });
    } catch (error) {
      console.error("Error generating OAuth URL:", error);
      res.status(500).json({ message: "Error al generar URL de autorización" });
    }
  });

  // OAuth callback from Mercado Pago
  app.get('/api/mercadopago/oauth/callback', async (req: any, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        console.error("Missing code or state in OAuth callback");
        return res.redirect('/comercio?mp_error=missing_params');
      }
      
      // Validate state against session to prevent CSRF
      const sessionState = req.session?.mpOAuthState;
      if (!sessionState || sessionState !== state) {
        console.error("OAuth state mismatch - possible CSRF attempt");
        return res.redirect('/comercio?mp_error=invalid_state');
      }
      
      // Extract userId from state (format: "userId:csrfToken")
      const [userId] = (state as string).split(':');
      if (!userId) {
        console.error("Invalid state format in OAuth callback");
        return res.redirect('/comercio?mp_error=invalid_state');
      }
      
      // Clear the state from session after validation
      delete req.session.mpOAuthState;

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : 'http://localhost:5000';
      
      const redirectUri = `${baseUrl}/api/mercadopago/oauth/callback`;
      
      const tokenResponse = await exchangeCodeForToken(code as string, redirectUri);
      
      // Calculate token expiration
      const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
      
      // Save tokens to user
      await storage.updateUserMpTokens(userId, {
        mpAccessToken: tokenResponse.access_token,
        mpRefreshToken: tokenResponse.refresh_token,
        mpUserId: tokenResponse.user_id.toString(),
        mpTokenExpiresAt: expiresAt,
      });
      
      console.log(`Mercado Pago connected for user ${userId}, MP user ID: ${tokenResponse.user_id}`);
      
      res.redirect('/comercio?mp_connected=true');
    } catch (error) {
      console.error("Error in OAuth callback:", error);
      res.redirect('/comercio?mp_error=auth_failed');
    }
  });

  // Check if merchant has Mercado Pago connected
  app.get('/api/mercadopago/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const isConnected = !!user.mpAccessToken && !!user.mpUserId;
      const commission = getCommissionPercent();
      
      res.json({ 
        connected: isConnected,
        mpUserId: user.mpUserId || null,
        commission,
        oauthConfigured: isOAuthConfigured(),
      });
    } catch (error) {
      console.error("Error checking MP status:", error);
      res.status(500).json({ message: "Error al verificar estado de Mercado Pago" });
    }
  });

  // Disconnect Mercado Pago
  app.post('/api/mercadopago/disconnect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      await storage.updateUserMpTokens(userId, {
        mpAccessToken: null,
        mpRefreshToken: null,
        mpUserId: null,
        mpTokenExpiresAt: null,
      });
      
      res.json({ success: true, message: "Mercado Pago desconectado" });
    } catch (error) {
      console.error("Error disconnecting MP:", error);
      res.status(500).json({ message: "Error al desconectar Mercado Pago" });
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
          if (purchase && purchase.paymentStatus !== 'pagado') {
            await storage.updatePurchaseStatus(purchaseId, 'pagado', paymentId);
            await storage.incrementOfferQuantitySold(purchase.offerId);
            
            // Get offer details for notification
            const offer = await storage.getOfferById(purchase.offerId);
            if (offer) {
              // Create notification for the business
              await storage.createNotification({
                userId: offer.business.id,
                type: 'nueva_venta',
                title: 'Nueva venta',
                message: `Vendiste "${offer.title}" por $${parseFloat(offer.discountedPrice).toLocaleString('es-AR')}`,
                relatedId: purchaseId,
              });
            }
          }
        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          await storage.updatePurchaseStatus(purchaseId, 'fallido', paymentId);
        }
      }
    } catch (error) {
      console.error("Webhook error:", error);
    }
  });

  // Notifications API
  app.get('/api/notificaciones', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificaciones = await storage.getNotificationsByUserId(userId);
      res.json(notificaciones);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Error al obtener notificaciones" });
    }
  });

  app.get('/api/notificaciones/count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Error al obtener conteo" });
    }
  });

  app.post('/api/notificaciones/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificationId = parseInt(req.params.id);
      
      // Verify notification belongs to user
      const notificaciones = await storage.getNotificationsByUserId(userId);
      const notification = notificaciones.find(n => n.id === notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notificación no encontrada" });
      }
      
      const updated = await storage.markNotificationAsRead(notificationId);
      res.json(updated);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Error al marcar como leída" });
    }
  });

  return httpServer;
}
