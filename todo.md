# Planexa TODO

## Stripe Payment Integration

- [x] Add Stripe database schema (stripe_customer_id, stripe_subscription_id)
- [x] Create products.ts with appointment type pricing
- [x] Implement checkout session creation endpoint
- [x] Add webhook handler for payment events
- [x] Create payment success/cancel pages
- [x] Add payment button to booking flow (UI integration)
- [x] Create payment history page
- [x] Register webhook endpoint in Express server
- [x] Add payment routes to App.tsx
- [ ] Test with Stripe test card (4242 4242 4242 4242)
- [ ] Claim Stripe sandbox and configure live keys

## UX Improvements

- [x] Add clear paid/free badges to service selection
- [x] Highlight paid services with visual indicators
- [x] Add payment summary banner in confirmation step
- [x] Show "No payment required" for free services

## 7-Day Free Trial Feature

- [x] Update database schema with trial tracking fields
- [x] Add trial start date and expiration logic
- [x] Create trial status checker in backend
- [x] Update booking confirmation to start trial
- [x] Add trial badge to confirmation page
- [x] Show trial countdown in dashboard
- [x] Create payment reminder before trial expires
- [ ] Block access after trial expires without payment

## Playwright E2E Tests

- [x] Set up Playwright configuration
- [x] Create test for free service booking flow
- [x] Create test for paid service booking with trial
- [x] Create test for trial badge display
- [x] Create test for payment button visibility
- [x] Create test for payment success/canceled pages
- [ ] Run all E2E tests and verify passing
