import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  decimal,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Accounts table (for OAuth providers)
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]
);

// Sessions table
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

// Verification tokens table
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

// Bills table
export const bills = pgTable("bills", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status", { enum: ["draft", "active", "settled"] }).default("active").notNull(),
  shareCode: text("share_code").notNull().unique(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bill Items table
export const billItems = pgTable("bill_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  billId: uuid("bill_id").references(() => bills.id).notNull(),
  name: text("name").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Participants table
export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  billId: uuid("bill_id").references(() => bills.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Item Assignments table
export const itemAssignments = pgTable("item_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id").references(() => billItems.id).notNull(),
  participantId: uuid("participant_id").references(() => participants.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Charges table (tax, service, discount, etc.)
export const charges = pgTable("charges", {
  id: uuid("id").defaultRandom().primaryKey(),
  billId: uuid("bill_id").references(() => bills.id).notNull(),
  type: text("type", { enum: ["tax", "service", "discount", "other"] }).notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  isPercentage: boolean("is_percentage").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment Info table
export const paymentInfo = pgTable("payment_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  billId: uuid("bill_id").references(() => bills.id).notNull(),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment Status table
export const paymentStatus = pgTable("payment_status", {
  id: uuid("id").defaultRandom().primaryKey(),
  participantId: uuid("participant_id").references(() => participants.id).notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Groups table
export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Group Members table
export const groupMembers = pgTable("group_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => groups.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type BillItem = typeof billItems.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type ItemAssignment = typeof itemAssignments.$inferSelect;
export type Charge = typeof charges.$inferSelect;
export type PaymentInfo = typeof paymentInfo.$inferSelect;
export type PaymentStatus = typeof paymentStatus.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
