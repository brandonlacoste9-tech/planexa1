import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).unique(),
  // Trial tracking
  trialStartedAt: timestamp("trialStartedAt"),
  trialEndsAt: timestamp("trialEndsAt"),
  isTrialActive: mysqlEnum("isTrialActive", ["true", "false"]).default("false").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["trial", "active", "canceled", "expired"]).default("trial").notNull(),
  // Notification contact info
  phoneNumber: varchar("phoneNumber", { length: 20 }),
});

/**
 * Subscriptions table to track user subscription status and billing.
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).unique(),
  status: mysqlEnum("status", ["trial", "active", "past_due", "canceled", "expired"]).default("trial").notNull(),
  trialStartedAt: timestamp("trialStartedAt").defaultNow().notNull(),
  trialEndsAt: timestamp("trialEndsAt").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Payments table to track Stripe transactions.
 * Stores only essential Stripe identifiers and metadata.
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }).unique(),
  appointmentTypeId: varchar("appointmentTypeId", { length: 64 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "canceled"]).default("pending").notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerName: text("customerName"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Notification preferences table to track user notification settings.
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Email preferences
  emailBookingConfirmation: mysqlEnum("emailBookingConfirmation", ["true", "false"]).default("true").notNull(),
  emailPaymentReceipt: mysqlEnum("emailPaymentReceipt", ["true", "false"]).default("true").notNull(),
  emailTrialReminder: mysqlEnum("emailTrialReminder", ["true", "false"]).default("true").notNull(),
  emailAppointmentReminder: mysqlEnum("emailAppointmentReminder", ["true", "false"]).default("true").notNull(),
  // SMS preferences
  smsEnabled: mysqlEnum("smsEnabled", ["true", "false"]).default("false").notNull(),
  smsPhoneNumber: varchar("smsPhoneNumber", { length: 20 }),
  smsAppointmentReminder24h: mysqlEnum("smsAppointmentReminder24h", ["true", "false"]).default("true").notNull(),
  smsAppointmentReminder1h: mysqlEnum("smsAppointmentReminder1h", ["true", "false"]).default("true").notNull(),
  // Voice preferences
  voiceEnabled: mysqlEnum("voiceEnabled", ["true", "false"]).default("false").notNull(),
  voicePhoneNumber: varchar("voicePhoneNumber", { length: 20 }),
  voiceCallReminder: mysqlEnum("voiceCallReminder", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;

/**
 * Notification logs table to track sent notifications.
 */
export const notificationLogs = mysqlTable("notificationLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["email", "sms", "voice"]).notNull(),
  recipient: varchar("recipient", { length: 320 }).notNull(),
  subject: text("subject"),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced"]).default("pending").notNull(),
  externalId: varchar("externalId", { length: 255 }),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"),
});

export type NotificationLog = typeof notificationLogs.$inferSelect;
export type InsertNotificationLog = typeof notificationLogs.$inferInsert;
