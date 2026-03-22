/**
 * Planexa Appointment Types as Stripe Products
 * Maps appointment types to Stripe product/price IDs
 */

export interface AppointmentProduct {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  durationMinutes: number;
  stripeProductId?: string;
  stripePriceId?: string;
}

export const appointmentProducts: AppointmentProduct[] = [
  {
    id: 'intro-consultation',
    name: 'Intro Consultation',
    description: 'Free introductory call to understand your needs and how we can help.',
    priceCents: 0,
    currency: 'USD',
    durationMinutes: 30,
  },
  {
    id: 'strategy-call',
    name: 'Strategy Call',
    description: 'Deep-dive strategic planning session to align on goals and roadmap.',
    priceCents: 20000, // $200.00
    currency: 'USD',
    durationMinutes: 60,
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    description: 'Progress check-in and next steps review.',
    priceCents: 12000, // $120.00
    currency: 'USD',
    durationMinutes: 45,
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Hands-on collaborative workshop for teams and stakeholders.',
    priceCents: 35000, // $350.00
    currency: 'USD',
    durationMinutes: 90,
  },
];

/**
 * Get product by ID
 */
export function getProductById(id: string): AppointmentProduct | undefined {
  return appointmentProducts.find(p => p.id === id);
}

/**
 * Format price in dollars
 */
export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
