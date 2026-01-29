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

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: text("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: userTypeEnum("user_type").default('usuario'),
  businessName: varchar("business_name"),
  phone: varchar("phone"),
  address: varchar("address"),
  category: categoryEnum("category"),
  cbu: varchar("cbu", { length: 22 }),
  mpAlias: varchar("mp_alias", { length: 50 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  // Mercado Pago OAuth fields for marketplace split payments
  mpAccessToken: text("mp_access_token"),
  mpRefreshToken: text("mp_refresh_token"),
  mpUserId: varchar("mp_user_id"),
  mpTokenExpiresAt: timestamp("mp_token_expires_at"),
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
  quantity: integer("quantity").notNull().default(1),
  quantitySold: integer("quantity_sold").notNull().default(0),
  status: offerStatusEnum("status").default('activa'),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  offerId: integer("offer_id").notNull().references(() => offers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentStatus: paymentStatusEnum("payment_status").default('pendiente'),
  mpPaymentId: varchar("mp_payment_id"),
  pickupCode: varchar("pickup_code", { length: 8 }),
  pickedUp: timestamp("picked_up"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  businessId: varchar("business_id").notNull().references(() => users.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  purchaseId: integer("purchase_id").notNull().references(() => purchases.id),
  stars: integer("stars").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"),
  read: timestamp("read"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  offers: many(offers),
  purchases: many(purchases),
  ratingsGiven: many(ratings),
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

export const ratingsRelations = relations(ratings, ({ one }) => ({
  business: one(users, {
    fields: [ratings.businessId],
    references: [users.id],
  }),
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  purchase: one(purchases, {
    fields: [ratings.purchaseId],
    references: [purchases.id],
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

export const insertOfferSchema = createInsertSchema(offers, {
  id: undefined,
  createdAt: undefined,
  status: undefined,
  businessId: undefined,
  quantitySold: undefined,
  expiresAt: undefined,
}).omit({
  id: true,
  createdAt: true,
  status: true,
  businessId: true,
  quantitySold: true,
  expiresAt: true,
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
  quantity: z.number().min(1, "La cantidad debe ser al menos 1").max(100, "La cantidad no puede superar 100"),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
  paymentStatus: true,
  mpPaymentId: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
}).extend({
  stars: z.number().min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas"),
  comment: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  read: true,
});

export const updateBusinessProfileSchema = z.object({
  businessName: z.string().min(2, "El nombre del comercio debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.enum(['panaderia', 'verduleria', 'carniceria', 'rotiseria', 'supermercado']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Business registration schema (email + password)
export const registerBusinessSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  businessName: z.string().min(2, "El nombre del comercio debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  address: z.string().min(5, "Ingresá una dirección válida"),
  category: z.enum(['panaderia', 'verduleria', 'carniceria', 'rotiseria', 'supermercado'], {
    required_error: "Seleccioná una categoría",
  }),
});

// User registration schema (simpler for regular users)
export const registerUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Extended types with relations
export type OfferWithBusiness = Offer & {
  business: User;
};

export type PurchaseWithOfferAndUser = Purchase & {
  offer: OfferWithBusiness;
  user: User;
};

export type RatingWithUser = Rating & {
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
