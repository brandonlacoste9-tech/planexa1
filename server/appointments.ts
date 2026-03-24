import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import { appointments, clients, Appointment, Client } from "../drizzle/schema";

/**
 * Create or get a client
 */
export async function upsertClient(
  userId: number,
  clientData: {
    name: string;
    email: string;
    phoneNumber?: string;
  }
): Promise<Client> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if client exists
  const existing = await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.userId, userId),
        eq(clients.email, clientData.email)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new client
  const insertData: any = {
    userId,
    name: clientData.name,
    email: clientData.email,
  };
  if (clientData.phoneNumber) insertData.phoneNumber = clientData.phoneNumber;

  await db.insert(clients).values([insertData]);

  const newClient = await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.userId, userId),
        eq(clients.email, clientData.email)
      )
    )
    .limit(1);

  return newClient[0]!;
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  userId: number,
  appointmentData: {
    clientId: number;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    appointmentType: string;
    duration: number;
    price: number | string;
    startTime: Date;
    endTime: Date;
    isTrialBooking?: boolean;
    notes?: string;
  }
): Promise<Appointment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertData: any = {
    userId,
    clientId: appointmentData.clientId,
    clientName: appointmentData.clientName,
    clientEmail: appointmentData.clientEmail,
    appointmentType: appointmentData.appointmentType,
    duration: appointmentData.duration,
    price: appointmentData.price.toString(),
    startTime: appointmentData.startTime,
    endTime: appointmentData.endTime,
    isTrialBooking: appointmentData.isTrialBooking ? "true" : "false",
    status: "scheduled",
    paymentStatus: parseFloat(appointmentData.price.toString()) > 0 ? "pending" : "paid",
  };

  if (appointmentData.clientPhone) insertData.clientPhone = appointmentData.clientPhone;
  if (appointmentData.notes) insertData.notes = appointmentData.notes;

  await db.insert(appointments).values([insertData]);

  const appointmentList = await db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, userId))
    .limit(1);

  return appointmentList[0]!;
}

/**
 * Get all appointments for a user
 */
export async function getUserAppointments(userId: number): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, userId));
}

/**
 * Get appointments for a specific date range
 */
export async function getAppointmentsByDateRange(
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.userId, userId),
        gte(appointments.startTime, startDate),
        lte(appointments.startTime, endDate)
      )
    );
}

/**
 * Get all clients for a user
 */
export async function getUserClients(userId: number): Promise<Client[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId));
}

/**
 * Get a specific client
 */
export async function getClient(clientId: number): Promise<Client | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  return result[0] || null;
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: number,
  status: "scheduled" | "completed" | "canceled" | "no-show"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(appointments)
    .set({ status })
    .where(eq(appointments.id, appointmentId));
}

/**
 * Update appointment payment status
 */
export async function updateAppointmentPaymentStatus(
  appointmentId: number,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  paymentId?: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { paymentStatus };
  if (paymentId) updateData.paymentId = paymentId;

  await db
    .update(appointments)
    .set(updateData)
    .where(eq(appointments.id, appointmentId));
}

/**
 * Get total revenue for a user
 */
export async function getUserTotalRevenue(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.userId, userId),
        eq(appointments.paymentStatus, "paid")
      )
    );

  return result.reduce((sum, apt) => sum + parseFloat(apt.price.toString()), 0);
}

/**
 * Get appointment statistics
 */
export async function getAppointmentStats(userId: number): Promise<{
  total: number;
  completed: number;
  scheduled: number;
  canceled: number;
  noShow: number;
}> {
  const db = await getDb();
  if (!db) {
    return { total: 0, completed: 0, scheduled: 0, canceled: 0, noShow: 0 };
  }

  const result = await db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, userId));

  return {
    total: result.length,
    completed: result.filter(a => a.status === "completed").length,
    scheduled: result.filter(a => a.status === "scheduled").length,
    canceled: result.filter(a => a.status === "canceled").length,
    noShow: result.filter(a => a.status === "no-show").length,
  };
}
