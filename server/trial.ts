/**
 * Trial Management Helpers
 * Handles 7-day free trial logic for new users
 */

import { getDb } from "./db";
import { subscriptions, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const TRIAL_DAYS = 7;

/**
 * Start a new trial for a user
 * Called when user first signs up or books their first appointment
 */
export async function startUserTrial(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  // Create subscription record
  await db.insert(subscriptions).values({
    userId,
    status: "trial",
    trialStartedAt: now,
    trialEndsAt,
  });

  // Update user trial fields
  await db
    .update(users)
    .set({
      trialStartedAt: now,
      trialEndsAt,
      isTrialActive: "true",
      subscriptionStatus: "trial",
    })
    .where(eq(users.id, userId));
}

/**
 * Check if user's trial is still active
 */
export async function isTrialActive(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user.length || !user[0].trialEndsAt) return false;

  const now = new Date();
  return user[0].trialEndsAt > now && user[0].isTrialActive === "true";
}

/**
 * Get trial status for a user
 */
export async function getTrialStatus(userId: number): Promise<{
  isActive: boolean;
  daysRemaining: number;
  endsAt: Date | null;
  startedAt: Date | null;
}> {
  const db = await getDb();
  if (!db) {
    return { isActive: false, daysRemaining: 0, endsAt: null, startedAt: null };
  }

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user.length || !user[0].trialEndsAt) {
    return { isActive: false, daysRemaining: 0, endsAt: null, startedAt: null };
  }

  const now = new Date();
  const isActive = user[0].trialEndsAt > now && user[0].isTrialActive === "true";
  const daysRemaining = Math.ceil(
    (user[0].trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
  );

  return {
    isActive,
    daysRemaining: Math.max(0, daysRemaining),
    endsAt: user[0].trialEndsAt,
    startedAt: user[0].trialStartedAt,
  };
}

/**
 * End user's trial (called when trial expires or user cancels)
 */
export async function endUserTrial(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      isTrialActive: "false",
      subscriptionStatus: "expired",
    })
    .where(eq(users.id, userId));

  // Update subscription status
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (subscription.length) {
    await db
      .update(subscriptions)
      .set({ status: "expired" })
      .where(eq(subscriptions.id, subscription[0].id));
  }
}

/**
 * Upgrade trial to paid subscription
 */
export async function upgradeToPaidSubscription(
  userId: number,
  stripeSubscriptionId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();

  await db
    .update(users)
    .set({
      subscriptionStatus: "active",
    })
    .where(eq(users.id, userId));

  // Update or create subscription
  const existingSubscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existingSubscription.length) {
    await db
      .update(subscriptions)
      .set({
        status: "active",
        stripeSubscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .where(eq(subscriptions.id, existingSubscription[0].id));
  } else {
    await db.insert(subscriptions).values({
      userId,
      status: "active",
      stripeSubscriptionId,
      trialStartedAt: now,
      trialEndsAt: now,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    });
  }
}

/**
 * Check if user needs to pay (trial expired and no active subscription)
 */
export async function requiresPayment(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user.length) return false;

  // If trial is still active, no payment required
  if (user[0].isTrialActive === "true" && user[0].trialEndsAt) {
    const now = new Date();
    if (user[0].trialEndsAt > now) return false;
  }

  // Check if user has active subscription
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (subscription.length && subscription[0].status === "active") {
    return false;
  }

  // Otherwise, payment is required
  return true;
}
