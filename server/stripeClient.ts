import Stripe from "stripe";

/**
 * Stripe SDK requires a non-empty API key at construction. Use a test-shaped
 * placeholder when STRIPE_SECRET_KEY is unset (e.g. vitest, local) so modules
 * can load; real API calls still need a valid key in env.
 */
const PLACEHOLDER_KEY = "sk_test_00000000000000000000000000000000";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY?.trim() || PLACEHOLDER_KEY
);
