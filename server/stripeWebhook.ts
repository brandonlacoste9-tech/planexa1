/**
 * Stripe Webhook Handler
 * Processes Stripe events and updates payment status
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { updatePaymentStatus, getDb } from './db';
import { payments } from '../drizzle/schema';
import { stripe } from './stripeClient';

/**
 * Handle Stripe webhook events
 * This endpoint receives POST requests from Stripe when events occur
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (process.env.NODE_ENV === "production" && !webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return res.status(503).send("Webhook misconfigured");
  }

  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret ?? ''
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  // Handle test events for verification
  if (event.id.startsWith('evt_test_')) {
    console.log('[Stripe Webhook] Test event detected, returning verification response');
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Stripe Webhook] Checkout session completed:', session.id);

        const db = getDb();
        if (db) {
          const paymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

          // Find by session ID and update status (+ real payment intent if available)
          const updateSet: Record<string, unknown> = { status: 'succeeded', updatedAt: new Date() };
          if (paymentIntentId) updateSet.stripePaymentIntentId = paymentIntentId;

          await db.update(payments)
            .set(updateSet)
            .where(eq(payments.stripeCheckoutSessionId, session.id));

          console.log('[Stripe Webhook] Payment status updated to succeeded for session', session.id);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Stripe Webhook] Payment intent succeeded:', paymentIntent.id);
        await updatePaymentStatus(paymentIntent.id, 'succeeded');
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Stripe Webhook] Payment intent failed:', paymentIntent.id);
        await updatePaymentStatus(paymentIntent.id, 'failed');
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('[Stripe Webhook] Charge refunded:', charge.id);
        if (charge.payment_intent) {
          const paymentIntentId = typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent.id;
          await updatePaymentStatus(paymentIntentId, 'canceled');
        }
        break;
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    // Return 200 to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
