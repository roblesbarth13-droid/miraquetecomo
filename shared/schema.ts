import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  pgEnum,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userTypeEnum = pgEnum('user_type', ['usuario', 'comercio']);
export const offerStatusEnum = pgEnum('offer_status', ['activa', 'vendida', 'expirada']);
export const paymentStatusEnum = pgEnum('payment_status', ['pendiente', 'pagado', 'fallido']);
export const categoryEnum = pgEnum('category', ['panaderia', 'verduleria', 'carniceria', 'rotiseria', 'supermercado']);

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: userTypeEnum("user_type").default('usuario'),
  businessName: varchar("business_name"),
  phone: varchar("phone"),
  address: varchar("address"),
  category: categoryEnum("category"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Offers table
export const offers = pgTable("offers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  businessId: varchar("business_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: integer("discount_percentage").notNull(),
  pickupTimeStart: varchar("pickup_time_start", { length: 5 }).notNull(),
  pickupTimeEnd: varchar("pickup_time_end", { length: 5 }).notNull(),
  imageUrl: text("image_url"),
  status: offerStatusEnum("status").default('activa'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  offerId: integer("offer_id").notNull().references(() => offers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentStatus: paymentStatusEnum("payment_status").default('pendiente'),
  mpPaymentId: varchar("mp_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  offers: many(offers),
  purchases: many(purchases),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  business: one(users, {
    fields: [offers.businessId],
    references: [users.id],
  }),
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  offer: one(offers, {
    fields: [purchases.offerId],
    references: [offers.id],
  }),
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
}));

// Insert schemas with validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  status: true,
  businessId: true,
}).extend({
  originalPrice: z.string().refine((val) => parseFloat(val) > 0, {
    message: "El precio original debe ser mayor a 0",
  }),
  discountedPrice: z.string().refine((val) => parseFloat(val) > 0, {
    message: "El precio con descuento debe ser mayor a 0",
  }),
  discountPercentage: z.number().min(1, "El descuento debe ser al menos 1%").max(90, "El descuento no puede superar el 90%"),
  pickupTimeStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  pickupTimeEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
  paymentStatus: true,
  mpPaymentId: true,
});

export const updateBusinessProfileSchema = z.object({
  businessName: z.string().min(2, "El nombre del comercio debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.enum(['panaderia', 'verduleria', 'carniceria', 'rotiseria', 'supermercado']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

// Extended types with relations
export type OfferWithBusiness = Offer & {
  business: User;
};

export type PurchaseWithOfferAndUser = Purchase & {
  offer: OfferWithBusiness;
  user: User;
};

// Category display names
export const categoryDisplayNames: Record<string, string> = {
  panaderia: "Panadería",
  verduleria: "Verdulería",
  carniceria: "Carnicería",
  rotiseria: "Rotisería",
  supermercado: "Supermercado",
};

// Status display names
export const statusDisplayNames: Record<string, string> = {
  activa: "Activa",
  vendida: "Vendida",
  expirada: "Expirada",
};
