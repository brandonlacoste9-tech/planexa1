import { and, eq, isNotNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, payments, InsertPayment, type User } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByBookingSlug(normalizedSlug: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  const n = normalizedSlug.trim().toLowerCase();
  if (!n) {
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(and(isNotNull(users.bookingSlug), sql`LOWER(${users.bookingSlug}) = ${n}`))
    .limit(1);

  return result[0];
}

export async function updateUserBusinessProfile(
  userId: number,
  fields: {
    bookingSlug: string | null;
    businessName: string | null;
    businessDescription: string | null;
    businessTimezone: string | null;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user business profile: database not available");
    return;
  }

  await db
    .update(users)
    .set({
      bookingSlug: fields.bookingSlug,
      businessName: fields.businessName,
      businessDescription: fields.businessDescription,
      businessTimezone: fields.businessTimezone,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Update user's Stripe customer ID
 */
export async function updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user Stripe customer ID:", error);
    throw error;
  }
}

/**
 * Create a payment record
 */
export async function createPayment(payment: InsertPayment): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create payment: database not available");
    return;
  }

  try {
    await db.insert(payments).values(payment);
  } catch (error) {
    console.error("[Database] Failed to create payment:", error);
    throw error;
  }
}

/**
 * Get payment by Stripe payment intent ID
 */
export async function getPaymentByStripePaymentIntentId(stripePaymentIntentId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payment: database not available");
    return undefined;
  }

  const result = await db.select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(stripePaymentIntentId: string, status: 'pending' | 'succeeded' | 'failed' | 'canceled'): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update payment: database not available");
    return;
  }

  try {
    await db.update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
  } catch (error) {
    console.error("[Database] Failed to update payment status:", error);
    throw error;
  }
}

/**
 * Get user's payment history
 */
export async function getUserPayments(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payments: database not available");
    return [];
  }

  try {
    return await db.select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(payments.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get user payments:", error);
    return [];
  }
}

// TODO: add additional feature queries here as your schema grows.
