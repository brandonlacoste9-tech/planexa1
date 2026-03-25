/**
 * Central SEO config for Planexa (used by the client RouteSeo and server sitemap/robots).
 */

import { DEMO_BOOKING_SLUGS } from "./demoCatalog";

export const SITE_NAME = "Planexa";

export const DEFAULT_OG_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463499911/XkFRBSJqRpfu5RhGJQf3Nn/planexa-hero-bg-DDUhr6nNsPQdWN2ua6Nxbe.webp";

export const DEFAULT_DESCRIPTION =
  "Planexa helps businesses manage bookings, staff availability, and client appointments with ease.";

export type SeoMeta = {
  title: string;
  description: string;
  /** If false, search engines should not index (dashboard / transactional pages). */
  indexable: boolean;
  /** Open Graph type */
  ogType: "website" | "article";
};

const ROUTES: Record<string, SeoMeta> = {
  "/": {
    title: `${SITE_NAME} — Scheduling SaaS`,
    description: DEFAULT_DESCRIPTION,
    indexable: true,
    ogType: "website",
  },
  "/calendar": {
    title: `Calendar | ${SITE_NAME}`,
    description:
      "Weekly calendar view with appointment types, availability, and scheduling tools.",
    indexable: false,
    ogType: "website",
  },
  "/clients": {
    title: `Clients | ${SITE_NAME}`,
    description:
      "Manage client profiles, appointment history, and relationships in one place.",
    indexable: false,
    ogType: "website",
  },
  "/analytics": {
    title: `Analytics | ${SITE_NAME}`,
    description:
      "Revenue, show rates, and appointment analytics for your business.",
    indexable: false,
    ogType: "website",
  },
  "/settings": {
    title: `Settings | ${SITE_NAME}`,
    description: "Account and workspace settings for Planexa.",
    indexable: false,
    ogType: "website",
  },
  "/payments": {
    title: `Payments | ${SITE_NAME}`,
    description: "Payment history and billing in Planexa.",
    indexable: false,
    ogType: "website",
  },
  "/payment-success": {
    title: `Payment successful | ${SITE_NAME}`,
    description: "Your payment was processed successfully.",
    indexable: false,
    ogType: "website",
  },
  "/payment-canceled": {
    title: `Payment canceled | ${SITE_NAME}`,
    description: "Checkout was canceled.",
    indexable: false,
    ogType: "website",
  },
  "/notification-settings": {
    title: `Notification settings | ${SITE_NAME}`,
    description: "Email, SMS, and voice notification preferences.",
    indexable: false,
    ogType: "website",
  },
  "/404": {
    title: `Page not found | ${SITE_NAME}`,
    description: "The page you requested could not be found.",
    indexable: false,
    ogType: "website",
  },
};

function normalizePath(path: string): string {
  if (!path || path === "") return "/";
  const noQuery = path.split("?")[0] ?? "/";
  if (noQuery.length > 1 && noQuery.endsWith("/")) {
    return noQuery.slice(0, -1);
  }
  return noQuery;
}

export function getBookingSeoMeta(slug: string): SeoMeta {
  const label = slug.replace(/-/g, " ");
  return {
    title: `Book an appointment | ${label} | ${SITE_NAME}`,
    description: `Schedule a service online with ${label}. Powered by ${SITE_NAME}.`,
    indexable: true,
    ogType: "website",
  };
}

export function getSeoMeta(pathname: string): SeoMeta {
  const path = normalizePath(pathname);
  if (path.startsWith("/book/")) {
    const slug = path.slice("/book/".length);
    if (slug) return getBookingSeoMeta(decodeURIComponent(slug));
  }
  return ROUTES[path] ?? ROUTES["/404"]!;
}

/** Paths listed in sitemap.xml (absolute URLs built on the server). */
export function getSitemapPaths(): string[] {
  const staticPaths = Object.keys(ROUTES).filter(p => p !== "/404");
  const bookPaths = DEMO_BOOKING_SLUGS.map(s => `/book/${s}`);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of [...staticPaths, ...bookPaths]) {
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}
