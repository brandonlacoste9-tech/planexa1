import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test('should navigate to payment success page', async ({ page }) => {
    // Navigate directly to payment success page
    await page.goto('/payment-success');

    // Verify success page loads
    await page.waitForSelector('text=Payment Successful');
    await expect(page.locator('text=Payment Successful')).toBeVisible();

    // Verify success message
    const successMessage = page.locator('text=Your payment has been processed');
    await expect(successMessage).toBeVisible();

    // Verify there's a button to continue
    const continueButton = page.locator('button:has-text("Continue to Dashboard")');
    await expect(continueButton).toBeVisible();
  });

  test('should navigate to payment canceled page', async ({ page }) => {
    // Navigate directly to payment canceled page
    await page.goto('/payment-canceled');

    // Verify canceled page loads
    await page.waitForSelector('text=Payment Canceled');
    await expect(page.locator('text=Payment Canceled')).toBeVisible();

    // Verify canceled message
    const canceledMessage = page.locator('text=Your payment was canceled');
    await expect(canceledMessage).toBeVisible();

    // Verify there's a button to go back
    const backButton = page.locator('button:has-text("Back to Booking")');
    await expect(backButton).toBeVisible();
  });

  test('should show payment history page structure', async ({ page }) => {
    // Navigate to payments page
    await page.goto('/payments');

    // Should load (may redirect to login or show empty state)
    await page.waitForLoadState('networkidle');

    // Verify page title or heading exists
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('payment button should be clickable on paid service', async ({ page }) => {
    await page.goto('/book/jmitchell');

    // Select paid service
    await page.waitForSelector('text=Select a service');
    const paidService = page.locator('button:has-text("Strategy Call")').first();
    await paidService.click();

    // Select date and time
    await page.waitForSelector('text=Pick a date');
    const dateButton = page.locator('button:has-text("25")').first();
    await dateButton.click();

    await page.waitForSelector('text=Pick a time');
    const timeButton = page.locator('button:has-text("09:00 am")').first();
    await timeButton.click();

    // Fill details
    await page.waitForSelector('text=Your details');
    await page.fill('input[placeholder="Alice Thompson"]', 'Payment Test');
    await page.fill('input[placeholder="alice@example.com"]', 'payment@test.com');

    // Review booking
    const reviewButton = page.locator('button:has-text("Review Booking")');
    await reviewButton.click();

    // On confirmation, should show trial message
    await page.waitForSelector('text=You\'re all set!');

    // During trial, should show "Continue to Dashboard" instead of payment button
    const continueButton = page.locator('button:has-text("Continue to Dashboard")');
    await expect(continueButton).toBeVisible();

    // Payment button should not be visible during trial
    const paymentButton = page.locator('button:has-text("Complete Payment")');
    await expect(paymentButton).not.toBeVisible();
  });

  test('should display price correctly on confirmation', async ({ page }) => {
    await page.goto('/book/jmitchell');

    // Select paid service
    await page.waitForSelector('text=Select a service');
    const paidService = page.locator('button:has-text("Workshop")').first();
    await paidService.click();

    // Select date and time
    await page.waitForSelector('text=Pick a date');
    const dateButton = page.locator('button:has-text("25")').first();
    await dateButton.click();

    await page.waitForSelector('text=Pick a time');
    const timeButton = page.locator('button:has-text("10:30 am")').first();
    await timeButton.click();

    // Fill details
    await page.waitForSelector('text=Your details');
    await page.fill('input[placeholder="Alice Thompson"]', 'Price Test');
    await page.fill('input[placeholder="alice@example.com"]', 'price@test.com');

    // Review booking
    const reviewButton = page.locator('button:has-text("Review Booking")');
    await reviewButton.click();

    // Verify price is displayed
    await page.waitForSelector('text=You\'re all set!');
    const priceText = page.locator('text=$350');
    await expect(priceText).toBeVisible();
  });

  test('should show trial countdown in confirmation', async ({ page }) => {
    await page.goto('/book/jmitchell');

    // Select paid service
    await page.waitForSelector('text=Select a service');
    const paidService = page.locator('button:has-text("Strategy Call")').first();
    await paidService.click();

    // Select date and time
    await page.waitForSelector('text=Pick a date');
    const dateButton = page.locator('button:has-text("25")').first();
    await dateButton.click();

    await page.waitForSelector('text=Pick a time');
    const timeButton = page.locator('button:has-text("09:00 am")').first();
    await timeButton.click();

    // Fill details
    await page.waitForSelector('text=Your details');
    await page.fill('input[placeholder="Alice Thompson"]', 'Trial Test');
    await page.fill('input[placeholder="alice@example.com"]', 'trial@test.com');

    // Review booking
    const reviewButton = page.locator('button:has-text("Review Booking")');
    await reviewButton.click();

    // Verify trial information is displayed
    await page.waitForSelector('text=You\'re all set!');
    const trialBadge = page.locator('text=7-Day Free Trial Active');
    await expect(trialBadge).toBeVisible();

    const trialDays = page.locator('text=7 days');
    await expect(trialDays).toBeVisible();
  });
});
