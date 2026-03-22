/**
 * Stripe Payment Router
 * Handles checkout session creation and webhook events
 */

import Stripe from 'stripe';
import { protectedProcedure, publicProcedure, router } from './_core/trpc';
import { z } from 'zod';
import {
  createPayment,
  updatePaymentStatus,
  updateUserStripeCustomerId,
  getPaymentByStripePaymentIntentId,
} from './db';
import { TRPCError } from '@trpc/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export const stripeRouter = router({
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

  /**
   * Verify webhook signature (for testing)
   */
  verifyWebhookSignature: publicProcedure
    .input(
      z.object({
        signature: z.string(),
        payload: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const event = stripe.webhooks.constructEvent(
          input.payload,
          input.signature,
          process.env.STRIPE_WEBHOOK_SECRET || ''
        );

        return {
          verified: true,
          eventType: event.type,
        };
      } catch (error) {
        console.error('[Stripe] Webhook verification failed:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Webhook signature verification failed',
        });
      }
    }),
});
