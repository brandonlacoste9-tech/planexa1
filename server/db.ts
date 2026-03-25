import { and, eq, isNotNull, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  payments,
  InsertPayment,
  type User,
  type Client,
  type Appointment,
  type Availability,
  availability,
  clients,
  appointments,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { ssl: "require" });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByBookingSlug(normalizedSlug: string): Promise<User | undefined> {
  const db = getDb();
  if (!db) return undefined;
  const n = normalizedSlug.trim().toLowerCase();
  if (!n) return undefined;
  const result = await db
    .select().from(users)
    .where(and(isNotNull(users.bookingSlug), sql`LOWER(${users.bookingSlug}) = ${n}`))
    .limit(1);
  return result[0];
}

export async function updateUserBusinessProfile(
  userId: number,
  fields: { bookingSlug: string | null; businessName: string | null; businessDescription: string | null; businessTimezone: string | null; }
): Promise<void> {
  const db = getDb();
  if (!db) { console.warn("[Database] Cannot update user business profile: database not available"); return; }
  await db.update(users).set({ ...fields, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<void> {
  const db = getDb();
  if (!db) { console.warn("[Database] Cannot update user: database not available"); return; }
  try {
    await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId));
  } catch (error) { console.error("[Database] Failed to update user Stripe customer ID:", error); throw error; }
}

export async function createPayment(payment: InsertPayment): Promise<void> {
  const db = getDb();
  if (!db) { console.warn("[Database] Cannot create payment: database not available"); return; }
  try { await db.insert(payments).values(payment); }
  catch (error) { console.error("[Database] Failed to create payment:", error); throw error; }
}

export async function getPaymentByStripePaymentIntentId(stripePaymentIntentId: string) {
  const db = getDb();
  if (!db) { console.warn("[Database] Cannot get payment: database not available"); return undefined; }
  const result = await db.select().from(payments).where(eq(payments.stripePaymentIntentId, stripePaymentIntentId)).limit(1);
  return result[0];
}

export async function updatePaymentStatus(stripePaymentIntentId: string, status: "pending" | "succeeded" | "failed" | "canceled"): Promise<void> {
  const db = getDb();
  if (!db) { console.warn("[Database] Cannot update payment: database not available"); return; }
  try { await db.update(payments).set({ status, updatedAt: new Date() }).where(eq(payments.stripePaymentIntentId, stripePaymentIntentId)); }
  catch (error) { console.error("[Database] Failed to update payment status:", error); throw error; }
}

export async function getUserPayments(userId: number) {
  const db = getDb();
  if (!db) { console.warn("[Database] Cannot get payments: database not available"); return []; }
  try { return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(payments.createdAt); }
  catch (error) { console.error("[Database] Failed to get user payments:", error); return []; }
}

// ─── Availability ────────────────────────────────────────────────────────────

export async function getAvailabilityForUser(userId: number): Promise<Availability[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(availability).where(eq(availability.userId, userId));
}

export async function upsertAvailabilityForDay(
  userId: number,
  dayOfWeek: number,
  data: { startTime: string; endTime: string; isEnabled: boolean }
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(availability)
    .values({ userId, dayOfWeek, ...data })
    .onConflictDoUpdate({
      target: [availability.userId, availability.dayOfWeek],
      set: data,
    });
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export async function getAppointmentsByUserAndDate(userId: number, date: string): Promise<Appointment[]> {
  const db = getDb();
  if (!db) return [];
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);
  return db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.userId, userId),
        sql`${appointments.startTime} >= ${dayStart}`,
        sql`${appointments.startTime} <= ${dayEnd}`,
        sql`${appointments.status} != 'canceled'`
      )
    );
}

export async function upsertBookingClient(
  userId: number,
  email: string,
  data: { name: string; phoneNumber?: string | null }
): Promise<Client> {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select().from(clients)
    .where(and(eq(clients.userId, userId), eq(clients.email, email.toLowerCase())))
    .limit(1);

  if (existing[0]) {
    await db.update(clients)
      .set({ name: data.name, phoneNumber: data.phoneNumber ?? null, updatedAt: new Date() })
      .where(eq(clients.id, existing[0].id));
    return { ...existing[0], name: data.name, phoneNumber: data.phoneNumber ?? null };
  }

  const result = await db.insert(clients).values({
    userId,
    name: data.name,
    email: email.toLowerCase(),
    phoneNumber: data.phoneNumber ?? null,
  }).returning();
  return result[0];
}

export async function createAppointmentRecord(data: {
  userId: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  appointmentType: string;
  duration: number;
  price: string;
  startTime: Date;
  endTime: Date;
  notes?: string | null;
}): Promise<Appointment> {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointments).values({
    userId: data.userId,
    clientId: data.clientId,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone ?? null,
    appointmentType: data.appointmentType,
    duration: data.duration,
    price: data.price,
    status: "scheduled",
    startTime: data.startTime,
    endTime: data.endTime,
    notes: data.notes ?? null,
    paymentStatus: "pending",
    isTrialBooking: false,
  }).returning();
  return result[0];
}
