# Stripe Payment Integration Testing Guide

## Overview

Planexa now includes full Stripe payment processing. This guide walks you through testing and going live.

## Quick Setup

### 1. Environment Variables (Already Configured)

The following environment variables are automatically injected:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (for frontend)
- `STRIPE_WEBHOOK_SECRET` - For webhook signature verification

These are managed in **Settings → Payment** in the Manus dashboard.

### 2. Database Schema

The following tables have been created:
- **users** table: Added `stripeCustomerId` column to link users to Stripe customers
- **payments** table: Stores payment transaction records with Stripe IDs

Run migrations with:
```bash
pnpm db:push
```

### 3. Backend Routes

#### Stripe Router (`/api/trpc/stripe`)
- `stripe.createCheckoutSession` - Creates a Stripe checkout session for an appointment
- `stripe.getPaymentHistory` - Retrieves user's payment history

#### Webhook Endpoint (`/api/stripe/webhook`)
- Receives Stripe events for payment status updates
- Automatically updates payment records in the database
- Handles: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

### 4. Frontend Pages

- **Booking Page** (`/book/:slug`) - Added "Complete Payment" button in confirmation step
- **Payment Success** (`/payment-success`) - Confirmation page after successful payment
- **Payment Canceled** (`/payment-canceled`) - Notification page if payment is canceled
- **Payment History** (`/payments`) - Shows all user transactions (requires login)

## Testing with Stripe Test Mode

### Test Card Numbers

Use these test cards in Stripe's test mode:

| Card Number | Expiry | CVC | Result |
|---|---|---|---|
| 4242 4242 4242 4242 | Any future date | Any 3 digits | ✅ Successful payment |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | ❌ Payment declined |
| 4000 0025 0000 3155 | Any future date | Any 3 digits | ⚠️ Requires authentication |

### Testing Flow

1. **Navigate to Booking Page**
   ```
   https://your-domain.com/book/jmitchell
   ```

2. **Select a Paid Service**
   - Choose "Strategy Call" ($200) or "Workshop" ($350)
   - Select a date and time
   - Enter your name and email

3. **Confirm Booking**
   - Review appointment details
   - Click "Complete Payment"

4. **Stripe Checkout**
   - Fill in test card: `4242 4242 4242 4242`
   - Use any future expiry date and CVC
   - Complete the payment

5. **Success Page**
   - You'll be redirected to `/payment-success`
   - Session ID will be displayed

6. **View Payment History**
   - Sign in to your dashboard
   - Navigate to `/payments`
   - See the transaction listed with status "succeeded"

### Testing Webhook Events

To test webhook events locally, use Stripe CLI:

```bash
# Install Stripe CLI (if not already installed)
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhook events to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger a test event
stripe trigger payment_intent.succeeded
```

The webhook will:
- Verify the signature
- Update the payment status in the database
- Log the event for debugging

## Going Live

### 1. Claim Your Stripe Sandbox

Your Stripe sandbox was created and must be claimed before **May 21, 2026**:

👉 [Claim Sandbox](https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVERiNHZCMW0wU21xNkRKLDE3NzQ3NjIzNDkv1005N2Uij4u)

### 2. Complete Stripe KYC

After claiming, complete Stripe's Know Your Customer (KYC) verification:
- Business information
- Bank account for payouts
- Identity verification

### 3. Switch to Live Keys

Once KYC is approved:
1. Go to Manus dashboard → **Settings → Payment**
2. Switch from Test mode to Live mode
3. Enter your live Stripe keys
4. Update `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`

### 4. Minimum Transaction Amount

Stripe requires a minimum order value of **$0.50 USD**. Transactions below this may fail.

### 5. Test with Live Data

Before going fully live:
- Process a test transaction with your live keys
- Verify the payment appears in Stripe Dashboard
- Check that the payment record is created in your database
- Confirm the webhook event is received and processed

## Troubleshooting

### Payment Button Not Appearing

- Ensure the appointment service has `price_cents > 0`
- Check browser console for errors
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly

### Checkout Session Creation Fails

- Check server logs for errors
- Verify `STRIPE_SECRET_KEY` is valid
- Ensure user is authenticated (payment requires login)

### Webhook Events Not Received

- Verify webhook endpoint is registered at `/api/stripe/webhook`
- Check Stripe Dashboard → Developers → Webhooks for delivery status
- Ensure `STRIPE_WEBHOOK_SECRET` matches your webhook signing secret
- Test with Stripe CLI to verify local setup

### Payment Status Not Updating

- Check database for payment records
- Verify webhook is being called (check logs)
- Ensure webhook signature verification passes
- Review `stripeWebhook.ts` for event handling logic

## Database Queries

### View All Payments

```sql
SELECT * FROM payments ORDER BY createdAt DESC;
```

### View Payments by User

```sql
SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC;
```

### View Succeeded Payments

```sql
SELECT * FROM payments WHERE status = 'succeeded' ORDER BY createdAt DESC;
```

### Calculate Total Revenue

```sql
SELECT SUM(CAST(amount AS DECIMAL(10,2))) as total_revenue 
FROM payments 
WHERE status = 'succeeded';
```

## File Structure

```
server/
  stripe.ts                 ← Stripe router with checkout & payment queries
  stripeWebhook.ts         ← Webhook event handler
  db.ts                    ← Payment database helpers
  _core/index.ts           ← Webhook endpoint registration

client/src/
  pages/
    Booking.tsx            ← Payment button integration
    Payments.tsx           ← Payment history page
    PaymentSuccess.tsx     ← Success confirmation
    PaymentCanceled.tsx    ← Cancellation notification
  components/
    PaymentSummary.tsx     ← Order summary component

shared/
  products.ts              ← Appointment pricing definitions

drizzle/
  schema.ts                ← Database schema with payments table
```

## Support

For issues or questions:
1. Check Stripe Dashboard for event logs
2. Review server logs for errors
3. Verify all environment variables are set
4. Test webhook delivery with Stripe CLI
5. Contact Stripe support for account issues

---

**Last Updated:** March 22, 2026
