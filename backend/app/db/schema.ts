import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  boolean,
  decimal,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Auth (from init) ───────────────────────────────────────────

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Business Profile ────────────────────────────────────────────

export const businesses = mysqlTable("businesses", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  whatsappNumber: varchar("whatsappNumber", { length: 50 }),
  businessHours: varchar("businessHours", { length: 255 }),
  deliveryInfo: text("deliveryInfo"),
  paymentMethods: text("paymentMethods"),
  aiEnabled: boolean("aiEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

// ─── Product Catalog ─────────────────────────────────────────────

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  businessId: bigint("businessId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => businesses.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  imageUrl: text("imageUrl"),
  availability: boolean("availability").default(true).notNull(),
  stockQuantity: int("stockQuantity").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── FAQ System ──────────────────────────────────────────────────

export const faqs = mysqlTable("faqs", {
  id: serial("id").primaryKey(),
  businessId: bigint("businessId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => businesses.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }),
  timesAsked: int("timesAsked").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;

// ─── Conversations (WhatsApp chats) ──────────────────────────────

export const conversations = mysqlTable("conversations", {
  id: serial("id").primaryKey(),
  businessId: bigint("businessId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => businesses.id),
  customerPhone: varchar("customerPhone", { length: 50 }).notNull(),
  customerName: varchar("customerName", { length: 255 }),
  status: mysqlEnum("status", ["active", "closed", "handed_off"])
    .default("active")
    .notNull(),
  aiHandled: boolean("aiHandled").default(true).notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// ─── Messages ────────────────────────────────────────────────────

export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversationId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => conversations.id),
  sender: mysqlEnum("sender", ["customer", "ai", "human"]).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON string for AI metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Human Handoff Requests ──────────────────────────────────────

export const handoffRequests = mysqlTable("handoff_requests", {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversationId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => conversations.id),
  businessId: bigint("businessId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => businesses.id),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "accepted", "resolved"])
    .default("pending")
    .notNull(),
  acceptedBy: bigint("acceptedBy", { mode: "number", unsigned: true })
    .references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type HandoffRequest = typeof handoffRequests.$inferSelect;
export type InsertHandoffRequest = typeof handoffRequests.$inferInsert;
