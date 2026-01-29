import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { registerBusinessSchema, registerUserSchema, loginSchema } from "@shared/schema";

const SALT_ROUNDS = 10;

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isAuthenticatedLocal(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "No autenticado" });
}

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

export function setupLocalAuth(app: Express) {
  app.post('/api/auth/register/comercio', async (req, res) => {
    try {
      const validation = registerBusinessSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: validation.error.errors 
        });
      }

      const { email, password, businessName, phone, address, category } = validation.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Este email ya está registrado" });
      }

      const passwordHash = await hashPassword(password);

      let coordinates: { lat: number; lng: number } | null = null;
      if (address) {
        coordinates = await geocodeAddress(address);
      }

      const user = await storage.createUser({
        email,
        passwordHash,
        userType: 'comercio',
        businessName,
        phone,
        address,
        category,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
      });

      req.session.userId = user.id;
      
      // Force session save before responding to avoid race condition
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Error al guardar sesión" });
        }
        res.status(201).json({
          message: "Comercio registrado exitosamente",
          user: {
            id: user.id,
            email: user.email,
            userType: user.userType,
            businessName: user.businessName,
          }
        });
      });
    } catch (error) {
      console.error("Error registering business:", error);
      res.status(500).json({ message: "Error al registrar comercio" });
    }
  });

  app.post('/api/auth/register/usuario', async (req, res) => {
    try {
      const validation = registerUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: validation.error.errors 
        });
      }

      const { email, password, firstName, lastName } = validation.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Este email ya está registrado" });
      }

      const passwordHash = await hashPassword(password);

      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        userType: 'usuario',
      });

      req.session.userId = user.id;
      
      // Force session save before responding to avoid race condition
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Error al guardar sesión" });
        }
        res.status(201).json({
          message: "Usuario registrado exitosamente",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
          }
        });
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Datos inválidos", 
          errors: validation.error.errors 
        });
      }

      const { email, password } = validation.data;

      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Email o contraseña incorrectos" });
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Email o contraseña incorrectos" });
      }

      req.session.userId = user.id;
      
      // Force session save before responding to avoid race condition
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Error al guardar sesión" });
        }
        res.json({
          message: "Inicio de sesión exitoso",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            businessName: user.businessName,
          }
        });
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Sesión cerrada" });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        businessName: user.businessName,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error al obtener usuario" });
    }
  });
}
