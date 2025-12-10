import {
  users,
  offers,
  purchases,
  ratings,
  type User,
  type UpsertUser,
  type Offer,
  type InsertOffer,
  type Purchase,
  type InsertPurchase,
  type Rating,
  type InsertRating,
  type OfferWithBusiness,
  type PurchaseWithOfferAndUser,
  type RatingWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gt, or, lt, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserToBusiness(id: string, businessData: { businessName: string; phone?: string; address?: string; category: string; latitude?: number | null; longitude?: number | null }): Promise<User>;
  
  getOffers(category?: string): Promise<OfferWithBusiness[]>;
  getOfferById(id: number): Promise<OfferWithBusiness | undefined>;
  createOffer(offer: InsertOffer & { businessId: string; expiresAt?: Date }): Promise<Offer>;
  updateOfferStatus(id: number, status: 'activa' | 'vendida' | 'expirada'): Promise<Offer | undefined>;
  incrementOfferQuantitySold(id: number): Promise<Offer | undefined>;
  getOffersByBusinessId(businessId: string): Promise<Offer[]>;
  
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchaseById(id: number): Promise<Purchase | undefined>;
  updatePurchaseStatus(id: number, status: 'pendiente' | 'pagado' | 'fallido', mpPaymentId?: string): Promise<Purchase | undefined>;
  getPurchasesByBusinessId(businessId: string): Promise<PurchaseWithOfferAndUser[]>;
  getPurchasesByUserId(userId: string): Promise<Purchase[]>;
  
  createRating(rating: InsertRating): Promise<Rating>;
  getRatingsByBusinessId(businessId: string): Promise<RatingWithUser[]>;
  getBusinessAverageRating(businessId: string): Promise<{ average: number; count: number }>;
  hasUserRatedPurchase(userId: string, purchaseId: number): Promise<boolean>;
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

  async updateUserToBusiness(id: string, businessData: { businessName: string; phone?: string; address?: string; category: string; latitude?: number | null; longitude?: number | null }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        userType: 'comercio',
        businessName: businessData.businessName,
        phone: businessData.phone,
        address: businessData.address,
        category: businessData.category as any,
        latitude: businessData.latitude,
        longitude: businessData.longitude,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getOffers(category?: string): Promise<OfferWithBusiness[]> {
    const now = new Date();
    
    // First, update expired offers
    await db
      .update(offers)
      .set({ status: 'expirada' })
      .where(
        and(
          eq(offers.status, 'activa'),
          lt(offers.expiresAt, now)
        )
      );
    
    // Build filter conditions: active, not expired, has stock
    const baseConditions = and(
      eq(offers.status, 'activa'),
      or(
        gt(offers.expiresAt, now),
        sql`${offers.expiresAt} IS NULL`
      ),
      lt(offers.quantitySold, offers.quantity)
    );
    
    const whereCondition = category 
      ? and(baseConditions, eq(offers.category, category as any))
      : baseConditions;
    
    const results = await db
      .select()
      .from(offers)
      .innerJoin(users, eq(offers.businessId, users.id))
      .where(whereCondition)
      .orderBy(desc(offers.createdAt));
    
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

  async createOffer(offerData: InsertOffer & { businessId: string; expiresAt?: Date }): Promise<Offer> {
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
        quantity: offerData.quantity || 1,
        expiresAt: offerData.expiresAt,
      })
      .returning();
    return offer;
  }

  async incrementOfferQuantitySold(id: number): Promise<Offer | undefined> {
    const [offer] = await db
      .update(offers)
      .set({ quantitySold: sql`${offers.quantitySold} + 1` })
      .where(eq(offers.id, id))
      .returning();
    
    // Check if sold out
    if (offer && offer.quantitySold >= offer.quantity) {
      await db.update(offers).set({ status: 'vendida' }).where(eq(offers.id, id));
      offer.status = 'vendida';
    }
    
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

  async getPurchaseById(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
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

  async createRating(ratingData: InsertRating): Promise<Rating> {
    const [rating] = await db
      .insert(ratings)
      .values(ratingData)
      .returning();
    return rating;
  }

  async getRatingsByBusinessId(businessId: string): Promise<RatingWithUser[]> {
    const results = await db
      .select()
      .from(ratings)
      .innerJoin(users, eq(ratings.userId, users.id))
      .where(eq(ratings.businessId, businessId))
      .orderBy(desc(ratings.createdAt));
    
    return results.map(row => ({
      ...row.ratings,
      user: row.users,
    }));
  }

  async getBusinessAverageRating(businessId: string): Promise<{ average: number; count: number }> {
    const result = await db
      .select({
        avg: sql<string>`COALESCE(AVG(${ratings.stars}), 0)`,
        count: sql<string>`COUNT(*)::int`,
      })
      .from(ratings)
      .where(eq(ratings.businessId, businessId));
    
    return {
      average: parseFloat(result[0]?.avg || "0"),
      count: parseInt(result[0]?.count || "0", 10),
    };
  }

  async hasUserRatedPurchase(userId: string, purchaseId: number): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.userId, userId),
          eq(ratings.purchaseId, purchaseId)
        )
      );
    return !!existing;
  }
}

export const storage = new DatabaseStorage();
