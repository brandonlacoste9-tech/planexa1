import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { notificationPreferences } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  sendTrialReminderEmail,
  sendAppointmentReminderEmail,
} from "./notifications/email";
import {
  sendAppointmentReminder24hSMS,
  sendAppointmentReminder1hSMS,
  sendPaymentReminderSMS,
  sendTrialReminderSMS,
} from "./notifications/sms";
import {
  sendAppointmentReminderVoiceCall,
  sendPaymentReminderVoiceCall,
  sendTrialReminderVoiceCall,
} from "./notifications/voice";

export const notificationRouter = router({
  /**
   * Get user's notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, ctx.user.id))
      .limit(1);

    return prefs[0] || null;
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailBookingConfirmation: z.boolean().optional(),
        emailPaymentReceipt: z.boolean().optional(),
        emailTrialReminder: z.boolean().optional(),
        emailAppointmentReminder: z.boolean().optional(),
        smsEnabled: z.boolean().optional(),
        smsPhoneNumber: z.string().optional(),
        smsAppointmentReminder24h: z.boolean().optional(),
        smsAppointmentReminder1h: z.boolean().optional(),
        voiceEnabled: z.boolean().optional(),
        voicePhoneNumber: z.string().optional(),
        voiceCallReminder: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if preferences exist
      const existing = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        const updateData: any = {};
        if (input.emailBookingConfirmation !== undefined)
          updateData.emailBookingConfirmation = input.emailBookingConfirmation ? "true" : "false";
        if (input.emailPaymentReceipt !== undefined)
          updateData.emailPaymentReceipt = input.emailPaymentReceipt ? "true" : "false";
        if (input.emailTrialReminder !== undefined)
          updateData.emailTrialReminder = input.emailTrialReminder ? "true" : "false";
        if (input.emailAppointmentReminder !== undefined)
          updateData.emailAppointmentReminder = input.emailAppointmentReminder ? "true" : "false";
        if (input.smsEnabled !== undefined)
          updateData.smsEnabled = input.smsEnabled ? "true" : "false";
        if (input.smsPhoneNumber !== undefined)
          updateData.smsPhoneNumber = input.smsPhoneNumber;
        if (input.smsAppointmentReminder24h !== undefined)
          updateData.smsAppointmentReminder24h = input.smsAppointmentReminder24h ? "true" : "false";
        if (input.smsAppointmentReminder1h !== undefined)
          updateData.smsAppointmentReminder1h = input.smsAppointmentReminder1h ? "true" : "false";
        if (input.voiceEnabled !== undefined)
          updateData.voiceEnabled = input.voiceEnabled ? "true" : "false";
        if (input.voicePhoneNumber !== undefined)
          updateData.voicePhoneNumber = input.voicePhoneNumber;
        if (input.voiceCallReminder !== undefined)
          updateData.voiceCallReminder = input.voiceCallReminder ? "true" : "false";
        updateData.updatedAt = new Date();

        await db
          .update(notificationPreferences)
          .set(updateData)
          .where(eq(notificationPreferences.userId, ctx.user.id));
      } else {
        // Create new
        await db.insert(notificationPreferences).values([
          {
            userId: ctx.user.id,
            emailBookingConfirmation: (input.emailBookingConfirmation ?? true) ? "true" : "false",
            emailPaymentReceipt: (input.emailPaymentReceipt ?? true) ? "true" : "false",
            emailTrialReminder: (input.emailTrialReminder ?? true) ? "true" : "false",
            emailAppointmentReminder: (input.emailAppointmentReminder ?? true) ? "true" : "false",
            smsEnabled: (input.smsEnabled ?? false) ? "true" : "false",
            smsPhoneNumber: input.smsPhoneNumber,
            smsAppointmentReminder24h: (input.smsAppointmentReminder24h ?? true) ? "true" : "false",
            smsAppointmentReminder1h: (input.smsAppointmentReminder1h ?? true) ? "true" : "false",
            voiceEnabled: (input.voiceEnabled ?? false) ? "true" : "false",
            voicePhoneNumber: input.voicePhoneNumber,
            voiceCallReminder: (input.voiceCallReminder ?? false) ? "true" : "false",
          },
        ]);
      }

      return { success: true };
    }),

  /**
   * Send booking confirmation notification
   */
  sendBookingConfirmation: publicProcedure
    .input(
      z.object({
        clientEmail: z.string().email(),
        clientName: z.string(),
        clientPhone: z.string().optional(),
        appointmentType: z.string(),
        date: z.string(),
        time: z.string(),
        duration: z.number(),
        price: z.number(),
        enableSMS: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const results = {
        email: false,
        sms: false,
      };

      // Send email
      if (input.clientEmail) {
        results.email = await sendBookingConfirmationEmail(
          input.clientEmail,
          input.clientName,
          input.appointmentType,
          input.date,
          input.time,
          input.duration,
          input.price
        );
      }

      return results;
    }),

  /**
   * Send payment receipt notification
   */
  sendPaymentReceipt: publicProcedure
    .input(
      z.object({
        clientEmail: z.string().email(),
        clientName: z.string(),
        appointmentType: z.string(),
        date: z.string(),
        amount: z.number(),
        transactionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendPaymentReceiptEmail(
        input.clientEmail,
        input.clientName,
        input.appointmentType,
        input.date,
        input.amount,
        input.transactionId
      );
    }),

  /**
   * Send trial expiration reminder
   */
  sendTrialReminder: publicProcedure
    .input(
      z.object({
        clientEmail: z.string().email(),
        clientName: z.string(),
        clientPhone: z.string().optional(),
        daysRemaining: z.number(),
        upgradeLink: z.string(),
        enableSMS: z.boolean().optional(),
        enableVoice: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const results = {
        email: false,
        sms: false,
        voice: false,
      };

      // Send email
      results.email = await sendTrialReminderEmail(
        input.clientEmail,
        input.clientName,
        input.daysRemaining,
        input.upgradeLink
      );

      // Send SMS if enabled and phone provided
      if (input.enableSMS && input.clientPhone) {
        results.sms = await sendTrialReminderSMS(
          input.clientPhone,
          input.clientName,
          input.daysRemaining
        );
      }

      // Send voice call if enabled and phone provided
      if (input.enableVoice && input.clientPhone) {
        results.voice = await sendTrialReminderVoiceCall(
          input.clientPhone,
          input.clientName,
          input.daysRemaining
        );
      }

      return results;
    }),

  /**
   * Send appointment reminder
   */
  sendAppointmentReminder: publicProcedure
    .input(
      z.object({
        clientEmail: z.string().email(),
        clientName: z.string(),
        clientPhone: z.string().optional(),
        appointmentType: z.string(),
        date: z.string(),
        time: z.string(),
        duration: z.number(),
        timeUntil: z.string(),
        enableSMS24h: z.boolean().optional(),
        enableSMS1h: z.boolean().optional(),
        enableVoice: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const results = {
        email: false,
        sms24h: false,
        sms1h: false,
        voice: false,
      };

      // Send email
      results.email = await sendAppointmentReminderEmail(
        input.clientEmail,
        input.clientName,
        input.appointmentType,
        input.date,
        input.time,
        input.duration,
        input.timeUntil
      );

      // Send SMS 24h before if enabled
      if (input.enableSMS24h && input.clientPhone) {
        results.sms24h = await sendAppointmentReminder24hSMS(
          input.clientPhone,
          input.clientName,
          input.appointmentType,
          input.time
        );
      }

      // Send SMS 1h before if enabled
      if (input.enableSMS1h && input.clientPhone) {
        results.sms1h = await sendAppointmentReminder1hSMS(
          input.clientPhone,
          input.clientName,
          input.appointmentType,
          input.time
        );
      }

      // Send voice call if enabled
      if (input.enableVoice && input.clientPhone) {
        results.voice = await sendAppointmentReminderVoiceCall(
          input.clientPhone,
          input.clientName,
          input.appointmentType,
          input.time
        );
      }

      return results;
    }),
});
