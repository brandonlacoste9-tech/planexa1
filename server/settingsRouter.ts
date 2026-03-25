import { businessInfo } from "@shared/demoCatalog";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { protectedProcedure, router } from "./_core/trpc";

const businessProfileInput = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .transform(s => s.trim().toLowerCase())
    .pipe(
      z.string().min(2).max(64).regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and single hyphens only."
      )
    ),
  description: z.string().max(2000),
  timezone: z.string().min(1).max(64),
});

const availabilityDayInput = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
  isEnabled: z.boolean(),
});

// Default Mon-Fri 9-5
const DEFAULT_SCHEDULE = [0, 1, 2, 3, 4, 5, 6].map(d => ({
  dayOfWeek: d,
  startTime: "09:00",
  endTime: "17:00",
  isEnabled: d >= 1 && d <= 5,
}));

export const settingsRouter = router({
  getBusinessProfile: protectedProcedure.query(({ ctx }) => {
    const u = ctx.user;
    return {
      name: u.businessName ?? businessInfo.name,
      slug: u.bookingSlug ?? businessInfo.slug,
      description: u.businessDescription ?? businessInfo.description,
      timezone: u.businessTimezone ?? businessInfo.timezone,
    };
  }),

  updateBusinessProfile: protectedProcedure
    .input(businessProfileInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await db.getUserByBookingSlug(input.slug);
      if (existing && existing.id !== ctx.user.id) {
        throw new TRPCError({ code: "CONFLICT", message: "That booking URL is already taken." });
      }
      await db.updateUserBusinessProfile(ctx.user.id, {
        bookingSlug: input.slug,
        businessName: input.name.trim(),
        businessDescription: input.description.trim(),
        businessTimezone: input.timezone.trim(),
      });
      return { success: true as const };
    }),

  getAvailability: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db.getAvailabilityForUser(ctx.user.id);
    if (rows.length === 0) return DEFAULT_SCHEDULE;
    // Fill any missing days with defaults
    return [0, 1, 2, 3, 4, 5, 6].map(d => {
      const row = rows.find(r => r.dayOfWeek === d);
      return row
        ? { dayOfWeek: d, startTime: row.startTime, endTime: row.endTime, isEnabled: row.isEnabled }
        : { dayOfWeek: d, startTime: "09:00", endTime: "17:00", isEnabled: false };
    });
  }),

  updateAvailability: protectedProcedure
    .input(z.object({ schedule: z.array(availabilityDayInput) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.schedule.map(d =>
          db.upsertAvailabilityForDay(ctx.user.id, d.dayOfWeek, {
            startTime: d.startTime,
            endTime: d.endTime,
            isEnabled: d.isEnabled,
          })
        )
      );
      return { success: true as const };
    }),
});
