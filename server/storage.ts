import {
  users,
  offers,
  purchases,
  type User,
  type UpsertUser,
  type Offer,
  type InsertOffer,
  type Purchase,
  type InsertPurchase,
  type OfferWithBusiness,
  type PurchaseWithOfferAndUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserToBusiness(id: string, businessData: { businessName: string; phone?: string; address?: string; category: string }): Promise<User>;
  
  getOffers(category?: string): Promise<OfferWithBusiness[]>;
  getOfferById(id: number): Promise<OfferWithBusiness | undefined>;
  createOffer(offer: InsertOffer & { businessId: string }): Promise<Offer>;
  updateOfferStatus(id: number, status: 'activa' | 'vendida' | 'expirada'): Promise<Offer | undefined>;
  getOffersByBusinessId(businessId: string): Promise<Offer[]>;
  
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchaseStatus(id: number, status: 'pendiente' | 'pagado' | 'fallido', mpPaymentId?: string): Promise<Purchase | undefined>;
  getPurchasesByBusinessId(businessId: string): Promise<PurchaseWithOfferAndUser[]>;
  getPurchasesByUserId(userId: string): Promise<Purchase[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserToBusiness(id: string, businessData: { businessName: string; phone?: string; address?: string; category: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        userType: 'comercio',
        businessName: businessData.businessName,
        phone: businessData.phone,
        address: businessData.address,
        category: businessData.category as any,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getOffers(category?: string): Promise<OfferWithBusiness[]> {
    const query = db
      .select()
      .from(offers)
      .innerJoin(users, eq(offers.businessId, users.id))
      .where(category ? and(eq(offers.status, 'activa'), eq(offers.category, category as any)) : eq(offers.status, 'activa'))
      .orderBy(desc(offers.createdAt));
    
    const results = await query;
    return results.map(row => ({
      ...row.offers,
      business: row.users,
    }));
  }

  async getOfferById(id: number): Promise<OfferWithBusiness | undefined> {
    const [result] = await db
      .select()
      .from(offers)
      .innerJoin(users, eq(offers.businessId, users.id))
      .where(eq(offers.id, id));
    
    if (!result) return undefined;
    return {
      ...result.offers,
      business: result.users,
    };
  }

  async createOffer(offerData: InsertOffer & { businessId: string }): Promise<Offer> {
    const [offer] = await db
      .insert(offers)
      .values({
        businessId: offerData.businessId,
        title: offerData.title,
        description: offerData.description,
        category: offerData.category,
        originalPrice: offerData.originalPrice,
        discountedPrice: offerData.discountedPrice,
        discountPercentage: offerData.discountPercentage,
        pickupTimeStart: offerData.pickupTimeStart,
        pickupTimeEnd: offerData.pickupTimeEnd,
        imageUrl: offerData.imageUrl,
      })
      .returning();
    return offer;
  }

  async updateOfferStatus(id: number, status: 'activa' | 'vendida' | 'expirada'): Promise<Offer | undefined> {
    const [offer] = await db
      .update(offers)
      .set({ status })
      .where(eq(offers.id, id))
      .returning();
    return offer;
  }

  async getOffersByBusinessId(businessId: string): Promise<Offer[]> {
    return await db
      .select()
      .from(offers)
      .where(eq(offers.businessId, businessId))
      .orderBy(desc(offers.createdAt));
  }

  async createPurchase(purchaseData: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values(purchaseData)
      .returning();
    return purchase;
  }

  async updatePurchaseStatus(id: number, status: 'pendiente' | 'pagado' | 'fallido', mpPaymentId?: string): Promise<Purchase | undefined> {
    const [purchase] = await db
      .update(purchases)
      .set({ paymentStatus: status, mpPaymentId })
      .where(eq(purchases.id, id))
      .returning();
    return purchase;
  }

  async getPurchasesByBusinessId(businessId: string): Promise<PurchaseWithOfferAndUser[]> {
    const results = await db
      .select()
      .from(purchases)
      .innerJoin(offers, eq(purchases.offerId, offers.id))
      .innerJoin(users, eq(purchases.userId, users.id))
      .where(eq(offers.businessId, businessId))
      .orderBy(desc(purchases.createdAt));
    
    return results.map(row => ({
      ...row.purchases,
      offer: {
        ...row.offers,
        business: row.users,
      },
      user: row.users,
    }));
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));
  }
}

export const storage = new DatabaseStorage();
