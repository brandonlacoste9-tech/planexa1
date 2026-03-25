/**
 * Startup warnings for production misconfiguration (non-fatal).
 */
export function logProductionWarnings(): void {
  if (process.env.NODE_ENV !== "production") return;

  const site =
    process.env.PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VITE_PUBLIC_SITE_URL?.trim();
  if (!site) {
    console.warn(
      "[Production] Set PUBLIC_SITE_URL or SITE_URL so sitemap, robots, and OG tags use your real domain."
    );
  }

  const stripe = process.env.STRIPE_SECRET_KEY?.trim();
  const placeholder = "sk_test_00000000000000000000000000000000";
  if (!stripe || stripe === placeholder) {
    console.warn(
      "[Production] STRIPE_SECRET_KEY is missing or placeholder; payments will not work."
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
    console.warn(
      "[Production] STRIPE_WEBHOOK_SECRET is not set; Stripe webhooks cannot be verified."
    );
  }

  if (!process.env.DATABASE_URL?.trim()) {
    console.warn(
      "[Production] DATABASE_URL is not set; user persistence and payment records may fail."
    );
  }

  if (!process.env.OAUTH_SERVER_URL?.trim() || !process.env.VITE_APP_ID?.trim()) {
    console.warn(
      "[Production] OAUTH_SERVER_URL and/or VITE_APP_ID missing; login may not work."
    );
  }
}
