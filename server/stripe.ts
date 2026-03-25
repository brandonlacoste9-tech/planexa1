/**
 * Stripe Payment Router
 * Handles checkout session creation and webhook events
 */

import { protectedProcedure, router } from './_core/trpc';
import { stripe } from './stripeClient';
import { z } from 'zod';
import {
  createPayment,
  updatePaymentStatus,
  updateUserStripeCustomerId,
  getPaymentByStripePaymentIntentId,
} from './db';
import { TRPCError } from '@trpc/server';
import { TRIAL_PERIOD_DAYS } from '@shared/const';
import { startUserTrial, getTrialStatus as getTrialStatusHelper } from './trial';

export const stripeRouter = router({
  /**
   * Start a free trial for a new user
   */
  startTrial: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = ctx.user;
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      await startUserTrial(user.id);

      const status = await getTrialStatusHelper(user.id);

      return {
        success: true,
        message: 'Trial started successfully',
        trialPeriodDays: TRIAL_PERIOD_DAYS,
        daysRemaining: status.daysRemaining,
        endsAt: status.endsAt,
        startedAt: status.startedAt,
        isActive: status.isActive,
      };
    } catch (error) {
      console.error('[Trial] Error starting trial:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to start trial',
      });
    }
  }),

  /**
   * Get current trial status for user
   */
  getTrialStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = ctx.user;
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const status = await getTrialStatusHelper(user.id);
      return status;
    } catch (error) {
      console.error('[Trial] Error getting trial status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get trial status',
      });
    }
  }),

  /**
   * Create a Stripe checkout session for an appointment
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        appointmentTypeId: z.string(),
        appointmentTypeName: z.string(),
        priceCents: z.number().min(0),
        currency: z.string().default('USD'),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = ctx.user;
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        // Create or retrieve Stripe customer
        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: user.email ?? undefined,
            name: user.name ?? undefined,
            metadata: {
              userId: user.id.toString(),
            },
          });
          stripeCustomerId = customer.id;
          await updateUserStripeCustomerId(user.id, stripeCustomerId);
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: input.currency.toLowerCase(),
                product_data: {
                  name: input.appointmentTypeName,
                },
                unit_amount: input.priceCents,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          client_reference_id: user.id.toString(),
          metadata: {
            userId: user.id.toString(),
            appointmentTypeId: input.appointmentTypeId,
            appointmentTypeName: input.appointmentTypeName,
          },
        });

        // Create payment record
        await createPayment({
          userId: user.id,
          stripePaymentIntentId: session.payment_intent?.toString() || '',
          stripeCheckoutSessionId: session.id,
          appointmentTypeId: input.appointmentTypeId,
          amount: (input.priceCents / 100).toString(),
          currency: input.currency,
          status: 'pending',
          customerEmail: user.email || undefined,
          customerName: user.name || undefined,
        });

        return {
          sessionId: session.id,
          checkoutUrl: session.url,
        };
      } catch (error) {
        console.error('[Stripe] Checkout session creation failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
        });
      }
    }),

  /**
   * Get payment history for the current user
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = ctx.user;
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // This would be implemented with a database query
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('[Stripe] Payment history fetch failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch payment history',
      });
    }
  }),
});
