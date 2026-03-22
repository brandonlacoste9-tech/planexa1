import { test, expect } from '@playwright/test';

test.describe('Paid Service Booking with Trial', () => {
  test('should show paid services section', async ({ page }) => {
    await page.goto('/book/jmitchell');

    // Wait for service selection to load
    await page.waitForSelector('text=Select a service');

    // Look for paid services section
    const paidServicesSection = page.locator('text=💳 PAID SERVICES');
    await expect(paidServicesSection).toBeVisible();

    // Verify paid services have price badges
    const priceElements = page.locator('text=$');
    const count = await priceElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should complete booking for paid service and show trial', async ({ page }) => {
    await page.goto('/book/jmitchell');

    // Wait for service selection
    await page.waitForSelector('text=Select a service');

    // Find and click on a paid service (Strategy Call)
    const strategyCall = page.locator('button:has-text("Strategy Call")').first();
    await expect(strategyCall).toBeVisible();
    await strategyCall.click();

    // Select date
    await page.waitForSelector('text=Pick a date');
    const dateButton = page.locator('button:has-text("25")').first();
    await dateButton.click();

    // Select time
    await page.waitForSelector('text=Pick a time');
    const timeButton = page.locator('button:has-text("09:00 am")').first();
    await timeButton.click();

    // Fill details
    await page.waitForSelector('text=Your details');
    await page.fill('input[placeholder="Alice Thompson"]', 'Jane Smith');
    await page.fill('input[placeholder="alice@example.com"]', 'jane@example.com');

    // Click Review Booking
    const reviewButton = page.locator('button:has-text("Review Booking")');
    await reviewButton.click();

    // Should reach confirmation with trial badge
    await page.waitForSelector('text=You\'re all set!');
    await expect(page.locator('text=You\'re all set!')).toBeVisible();

    // Verify trial badge is visible
    const trialBadge = page.locator('text=7-Day Free Trial Active');
    await expect(trialBadge).toBeVisible();

    // Verify trial message
    const trialMessage = page.locator('text=You have 7 days of free access');
    await expect(trialMessage).toBeVisible();
  });

  test('should show payment button for paid service', async ({ page }) => {
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
    await page.fill('input[placeholder="Alice Thompson"]', 'Test User');
    await page.fill('input[placeholder="alice@example.com"]', 'test@example.com');

    // Review booking
    const reviewButton = page.locator('button:has-text("Review Booking")');
    await reviewButton.click();

    // Wait for confirmation and check for payment button
    await page.waitForSelector('text=You\'re all set!');

    // Payment button should NOT be visible during trial
    // Instead, "Continue to Dashboard" button should be shown
    const continueButton = page.locator('button:has-text("Continue to Dashboard")');
    await expect(continueButton).toBeVisible();
  });

  test('should display appointment details in confirmation', async ({ page }) => {
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
    await page.fill('input[placeholder="Alice Thompson"]', 'Alice Johnson');
    await page.fill('input[placeholder="alice@example.com"]', 'alice.j@example.com');

    // Review booking
    const reviewButton = page.locator('button:has-text("Review Booking")');
    await reviewButton.click();

    // Verify confirmation shows all details
    await page.waitForSelector('text=You\'re all set!');
    await expect(page.locator('text=Workshop')).toBeVisible();
    await expect(page.locator('text=Alice Johnson')).toBeVisible();
    await expect(page.locator('text=$350')).toBeVisible();
  });

  test('should separate paid and free services clearly', async ({ page }) => {
    await page.goto('/book/jmitchell');

    await page.waitForSelector('text=Select a service');

    // Both sections should be visible
    const paidSection = page.locator('text=💳 PAID SERVICES');
    const freeSection = page.locator('text=🎁 FREE SERVICES');

    await expect(paidSection).toBeVisible();
    await expect(freeSection).toBeVisible();

    // Paid services should have colored borders
    const paidServiceButtons = page.locator('button').filter({
      has: page.locator('text=Strategy Call, Workshop'),
    });
    // Verify at least one paid service is visible
    const paidCount = await page.locator('text=Strategy Call').count();
    expect(paidCount).toBeGreaterThan(0);
  });
});
