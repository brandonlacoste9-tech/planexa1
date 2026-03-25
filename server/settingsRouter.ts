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
      z
        .string()
        .min(2)
        .max(64)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens only.")
    ),
  description: z.string().max(2000),
  timezone: z.string().min(1).max(64),
});

export const settingsRouter = router({
  getBusinessProfile: protectedProcedure.query(({ ctx }) => {
    const u = ctx.user;
    const defaults = businessInfo;
    return {
      name: u.businessName ?? defaults.name,
      slug: u.bookingSlug ?? defaults.slug,
      description: u.businessDescription ?? defaults.description,
      timezone: u.businessTimezone ?? defaults.timezone,
    };
  }),

  updateBusinessProfile: protectedProcedure
    .input(businessProfileInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await db.getUserByBookingSlug(input.slug);
      if (existing && existing.id !== ctx.user.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "That booking URL is already taken. Choose a different slug.",
        });
      }

      await db.updateUserBusinessProfile(ctx.user.id, {
        bookingSlug: input.slug,
        businessName: input.name.trim(),
        businessDescription: input.description.trim(),
        businessTimezone: input.timezone.trim(),
      });

      return { success: true as const };
    }),
});
