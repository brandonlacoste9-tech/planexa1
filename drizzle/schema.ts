import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["trial", "active", "canceled", "expired"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "succeeded", "failed", "canceled"]);
export const notificationTypeEnum = pgEnum("notification_type", ["email", "sms", "voice"]);
export const notificationLogStatusEnum = pgEnum("notification_log_status", ["pending", "sent", "failed", "bounced"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["scheduled", "completed", "canceled", "no-show"]);
export const appointmentPaymentStatusEnum = pgEnum("appointment_payment_status", ["pending", "paid", "failed", "refunded"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).unique(),
  trialStartedAt: timestamp("trialStartedAt"),
  trialEndsAt: timestamp("trialEndsAt"),
  isTrialActive: boolean("isTrialActive").default(false).notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscriptionStatus").default("trial").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  bookingSlug: varchar("bookingSlug", { length: 64 }).unique(),
  businessName: text("businessName"),
  businessDescription: text("businessDescription"),
  businessTimezone: varchar("businessTimezone", { length: 64 }),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).unique(),
  status: subscriptionStatusEnum("status").default("trial").notNull(),
  trialStartedAt: timestamp("trialStartedAt").defaultNow().notNull(),
  trialEndsAt: timestamp("trialEndsAt").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }).unique(),
  appointmentTypeId: varchar("appointmentTypeId", { length: 64 }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerName: text("customerName"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const notificationPreferences = pgTable("notificationPreferences", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull().unique(),
  emailBookingConfirmation: boolean("emailBookingConfirmation").default(true).notNull(),
  emailPaymentReceipt: boolean("emailPaymentReceipt").default(true).notNull(),
  emailTrialReminder: boolean("emailTrialReminder").default(true).notNull(),
  emailAppointmentReminder: boolean("emailAppointmentReminder").default(true).notNull(),
  smsEnabled: boolean("smsEnabled").default(false).notNull(),
  smsPhoneNumber: varchar("smsPhoneNumber", { length: 20 }),
  smsAppointmentReminder24h: boolean("smsAppointmentReminder24h").default(true).notNull(),
  smsAppointmentReminder1h: boolean("smsAppointmentReminder1h").default(true).notNull(),
  voiceEnabled: boolean("voiceEnabled").default(false).notNull(),
  voicePhoneNumber: varchar("voicePhoneNumber", { length: 20 }),
  voiceCallReminder: boolean("voiceCallReminder").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;

export const notificationLogs = pgTable("notificationLogs", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  type: notificationTypeEnum("type").notNull(),
  recipient: varchar("recipient", { length: 320 }).notNull(),
  subject: text("subject"),
  message: text("message"),
  status: notificationLogStatusEnum("status").default("pending").notNull(),
  externalId: varchar("externalId", { length: 255 }),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"),
});

export type NotificationLog = typeof notificationLogs.$inferSelect;
export type InsertNotificationLog = typeof notificationLogs.$inferInsert;

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  notes: text("notes"),
  totalAppointments: serial("totalAppointments").notNull(),
  totalSpent: numeric("totalSpent", { precision: 10, scale: 2 }).default("0").notNull(),
  lastAppointmentAt: timestamp("lastAppointmentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  clientId: serial("clientId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  appointmentType: varchar("appointmentType", { length: 255 }).notNull(),
  duration: serial("duration").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  status: appointmentStatusEnum("status").default("scheduled").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  notes: text("notes"),
  paymentId: serial("paymentId"),
  paymentStatus: appointmentPaymentStatusEnum("paymentStatus").default("pending").notNull(),
  isTrialBooking: boolean("isTrialBooking").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
