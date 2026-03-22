import { test, expect } from '@playwright/test';

test.describe('Free Service Booking Flow', () => {
  test('should complete booking for free service', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/book/jmitchell');

    // Wait for page to load
    await page.waitForSelector('text=Select a service');

    // Verify we're on the booking page
    await expect(page).toHaveTitle(/Planexa|booking/i);

    // Look for free services section
    const freeServicesSection = page.locator('text=🎁 FREE SERVICES');
    await expect(freeServicesSection).toBeVisible();

    // Find and click on a free service (Free Consultation)
    const freeConsultation = page.locator('button:has-text("Free Consultation")').first();
    await expect(freeConsultation).toBeVisible();
    await freeConsultation.click();

    // Should move to date selection step
    await page.waitForSelector('text=Pick a date');
    await expect(page.locator('text=Pick a date')).toBeVisible();

    // Select a future date (click on day 25)
    const dateButton = page.locator('button:has-text("25")').first();
    await dateButton.click();

    // Should move to time selection step
    await page.waitForSelector('text=Pick a time');
    await expect(page.locator('text=Pick a time')).toBeVisible();

    // Select a time slot
    const timeButton = page.locator('button:has-text("09:00 am")').first();
    await timeButton.click();

    // Should move to details step
    await page.waitForSelector('text=Your details');
    await expect(page.locator('text=Your details')).toBeVisible();

    // Fill in user details
    await page.fill('input[placeholder="Alice Thompson"]', 'John Doe');
    await page.fill('input[placeholder="alice@example.com"]', 'john@example.com');
    await page.fill('input[placeholder="+1 416-555-0000"]', '+1 416-555-1234');

    // Click Review Booking button
    const reviewButton = page.locator('button:has-text("Review Booking")');
    await reviewButton.click();

    // Should reach confirmation step
    await page.waitForSelector('text=You\'re all set!');
    await expect(page.locator('text=You\'re all set!')).toBeVisible();

    // Verify no payment button for free service
    const paymentButton = page.locator('button:has-text("Complete Payment")');
    await expect(paymentButton).not.toBeVisible();

    // Verify confirmation details
    await expect(page.locator('text=Free Consultation')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should show free badge on free services', async ({ page }) => {
    await page.goto('/book/jmitchell');

    // Wait for service selection to load
    await page.waitForSelector('text=Select a service');

    // Look for FREE badge
    const freeBadges = page.locator('text=FREE');
    const count = await freeBadges.count();
    expect(count).toBeGreaterThan(0);

    // Verify badge styling
    const firstFreeBadge = freeBadges.first();
    const bgColor = await firstFreeBadge.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(bgColor).toBeTruthy();
  });
});
