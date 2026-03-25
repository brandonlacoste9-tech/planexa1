import { publicProcedure, router } from "./_core/trpc";
import { getPublicBookingCatalog } from "./publicBookingCatalog";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getUserByBookingSlug,
  getAvailabilityForUser,
  getAppointmentsByUserAndDate,
  upsertBookingClient,
  createAppointmentRecord,
} from "./db";

const DEFAULT_AVAILABILITY = [
  { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isEnabled: false }, // Sun
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isEnabled: true },  // Mon
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isEnabled: true },  // Tue
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isEnabled: true },  // Wed
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isEnabled: true },  // Thu
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isEnabled: true },  // Fri
  { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", isEnabled: false }, // Sat
];

function timeToMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minsToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function generateSlots(
  startTime: string,
  endTime: string,
  durationMins: number,
  bufferMins: number,
  booked: { startMins: number; endMins: number }[]
): string[] {
  const start = timeToMins(startTime);
  const end = timeToMins(endTime);
  const slots: string[] = [];
  for (let t = start; t + durationMins <= end; t += 30) {
    const slotEnd = t + durationMins + bufferMins;
    if (!booked.some(b => t < b.endMins && slotEnd > b.startMins)) {
      slots.push(minsToTime(t));
    }
  }
  return slots;
}

// Demo slots for the jmitchell demo slug (Mon-Fri 9-5, minus a few booked)
const DEMO_BOOKED = new Set(["10:00", "14:00", "15:30"]);
function getDemoSlots(date: string): string[] {
  const day = new Date(date + "T12:00:00").getDay();
  if (day === 0 || day === 6) return []; // weekend
  return generateSlots("09:00", "17:00", 60, 0, []).filter(t => !DEMO_BOOKED.has(t));
}

export const bookingRouter = router({
  getCatalog: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => getPublicBookingCatalog(input.slug)),

  getSchedule: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const user = await getUserByBookingSlug(input.slug.trim().toLowerCase());
      if (!user) return { enabledDays: [1, 2, 3, 4, 5], timezone: "America/Toronto" };
      const avail = await getAvailabilityForUser(user.id);
      const schedule = avail.length > 0 ? avail : DEFAULT_AVAILABILITY;
      return {
        enabledDays: schedule.filter(d => d.isEnabled).map(d => d.dayOfWeek),
        timezone: user.businessTimezone ?? "America/Toronto",
      };
    }),

  getAvailableSlots: publicProcedure
    .input(z.object({
      slug: z.string(),
      date: z.string(),
      durationMinutes: z.number().int().positive(),
      bufferMinutes: z.number().int().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const user = await getUserByBookingSlug(input.slug.trim().toLowerCase());
      if (!user) return { slots: getDemoSlots(input.date) };

      const dayOfWeek = new Date(input.date + "T12:00:00").getDay();
      const avail = await getAvailabilityForUser(user.id);
      const schedule = avail.length > 0 ? avail : DEFAULT_AVAILABILITY;
      const day = schedule.find(d => d.dayOfWeek === dayOfWeek);
      if (!day?.isEnabled) return { slots: [] };

      const existing = await getAppointmentsByUserAndDate(user.id, input.date);
      const booked = existing.map(a => ({
        startMins: timeToMins(a.startTime.toISOString().substring(11, 16)),
        endMins: timeToMins(a.endTime.toISOString().substring(11, 16)),
      }));

      return { slots: generateSlots(day.startTime, day.endTime, input.durationMinutes, input.bufferMinutes, booked) };
    }),

  createBooking: publicProcedure
    .input(z.object({
      slug: z.string(),
      appointmentTypeId: z.string(),
      appointmentTypeName: z.string(),
      date: z.string(),
      time: z.string(),
      durationMinutes: z.number().int().positive(),
      priceCents: z.number().int().min(0),
      clientName: z.string().min(1).max(200),
      clientEmail: z.string().email(),
      clientPhone: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const user = await getUserByBookingSlug(input.slug.trim().toLowerCase());
      if (!user) {
        // Demo mode — succeed without persisting
        return { success: true, bookingId: `demo-${Date.now()}` };
      }

      const dayOfWeek = new Date(input.date + "T12:00:00").getDay();
      const avail = await getAvailabilityForUser(user.id);
      const schedule = avail.length > 0 ? avail : DEFAULT_AVAILABILITY;
      const day = schedule.find(d => d.dayOfWeek === dayOfWeek);
      if (!day?.isEnabled) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No availability on this day." });
      }

      const startTime = new Date(`${input.date}T${input.time}:00`);
      const endTime = new Date(startTime.getTime() + input.durationMinutes * 60 * 1000);
      const startMins = timeToMins(input.time);
      const endMins = startMins + input.durationMinutes;

      const existing = await getAppointmentsByUserAndDate(user.id, input.date);
      const conflict = existing.some(a => {
        const aMins = timeToMins(a.startTime.toISOString().substring(11, 16));
        const bMins = timeToMins(a.endTime.toISOString().substring(11, 16));
        return startMins < bMins && endMins > aMins;
      });
      if (conflict) {
        throw new TRPCError({ code: "CONFLICT", message: "This time slot is no longer available. Please pick another." });
      }

      const client = await upsertBookingClient(user.id, input.clientEmail, {
        name: input.clientName,
        phoneNumber: input.clientPhone,
      });

      const appt = await createAppointmentRecord({
        userId: user.id,
        clientId: client.id,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        appointmentType: input.appointmentTypeName,
        duration: input.durationMinutes,
        price: (input.priceCents / 100).toFixed(2),
        startTime,
        endTime,
        notes: input.notes,
      });

      return { success: true, bookingId: appt.id };
    }),
});
