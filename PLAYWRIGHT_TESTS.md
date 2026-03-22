# Playwright E2E Tests for Planexa

This document describes the comprehensive end-to-end test suite for Planexa's booking and payment system.

## Test Setup

**Configuration:** `playwright.config.ts`
- Base URL: `http://localhost:3000`
- Browser: Chromium
- Screenshots on failure
- HTML report generation

**Installation:**
```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

**Running Tests:**
```bash
pnpm exec playwright test
```

**View Results:**
```bash
pnpm exec playwright show-report
```

## Test Suites

### 1. Free Service Booking (`tests/e2e/booking-free.spec.ts`)

Tests the complete booking flow for free services.

**Tests:**
- `should complete booking for free service` — Full flow from service selection through confirmation
- `should show free badge on free services` — Verifies FREE labels are visible

**Coverage:**
- Service selection step
- Date/time selection
- User details form
- Confirmation page
- No payment button for free services

### 2. Paid Service with Trial (`tests/e2e/booking-paid-trial.spec.ts`)

Tests paid service booking with 7-day free trial activation.

**Tests:**
- `should show paid services section` — Verifies 💳 PAID SERVICES section is visible
- `should complete booking for paid service and show trial` — Full paid booking flow with trial badge
- `should show payment button for paid service` — Verifies payment UI elements
- `should display appointment details in confirmation` — Confirms all details are shown
- `should separate paid and free services clearly` — Verifies clear visual separation

**Coverage:**
- Paid services highlighting
- Trial badge display (🎁 7-Day Free Trial Active)
- Trial countdown message
- Service price display
- Appointment details in confirmation

### 3. Payment Flow (`tests/e2e/payment-flow.spec.ts`)

Tests payment success/canceled pages and payment integration.

**Tests:**
- `should navigate to payment success page` — Verifies success page loads
- `should navigate to payment canceled page` — Verifies canceled page loads
- `should show payment history page structure` — Verifies payments page exists
- `should show trial countdown in confirmation` — Verifies trial info display
- `should display price correctly on confirmation` — Confirms pricing accuracy

**Coverage:**
- Payment success page
- Payment canceled page
- Payment history page
- Price display
- Trial information display

## User Journeys Tested

### Journey 1: Free Service Booking
1. Navigate to `/book/jmitchell`
2. Select "Free Consultation" (free service)
3. Pick date and time
4. Enter details (name, email, phone)
5. Review booking
6. See confirmation (no payment required)

### Journey 2: Paid Service with Trial
1. Navigate to `/book/jmitchell`
2. Select "Strategy Call" or "Workshop" (paid service)
3. Pick date and time
4. Enter details
5. Review booking
6. See confirmation with:
   - 🎁 7-Day Free Trial Active badge
   - Trial countdown (7 days)
   - "Continue to Dashboard" button (not payment button)
   - Appointment details with price

### Journey 3: Payment Pages
1. Navigate to `/payment-success` — See success confirmation
2. Navigate to `/payment-canceled` — See cancellation message
3. Navigate to `/payments` — See payment history page

## Key Features Verified

✅ **Service Separation**
- Free services clearly marked with 🎁 FREE badge
- Paid services clearly marked with 💳 PAID badge
- Visual distinction with different colors/borders

✅ **Trial System**
- Trial badge shows on paid service confirmation
- Trial countdown displays (7 days)
- "Continue to Dashboard" button shown during trial
- Payment button hidden during trial

✅ **Booking Flow**
- All 5 steps complete successfully
- Form validation works
- Confirmation shows all details
- Prices display correctly

✅ **Payment Integration**
- Success page accessible
- Canceled page accessible
- Payment history page exists
- Trial information persists through flow

## Running Specific Tests

```bash
# Run only free service tests
pnpm exec playwright test booking-free.spec.ts

# Run only paid service tests
pnpm exec playwright test booking-paid-trial.spec.ts

# Run only payment tests
pnpm exec playwright test payment-flow.spec.ts

# Run a specific test
pnpm exec playwright test booking-free.spec.ts -g "should complete booking"

# Run in headed mode (see browser)
pnpm exec playwright test --headed

# Run in debug mode
pnpm exec playwright test --debug
```

## Troubleshooting

**Browsers not installed:**
```bash
pnpm exec playwright install
```

**Tests timing out:**
- Increase timeout in `playwright.config.ts`
- Check if dev server is running on port 3000

**Selectors not found:**
- Verify UI elements match test selectors
- Use `--debug` mode to inspect page

## CI/CD Integration

For GitHub Actions or other CI systems:

```yaml
- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm exec playwright test

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Next Steps

- Add tests for dashboard pages (Calendar, Clients, Analytics)
- Add authentication tests
- Add payment webhook tests
- Add trial expiration tests
- Add email notification tests
