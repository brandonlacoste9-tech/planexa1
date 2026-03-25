import {
  appointmentTypes,
  getDemoCatalogForSlug,
  type AppointmentType,
  type BookingBusiness,
} from "@shared/demoCatalog";
import type { User } from "../drizzle/schema";
import { getUserByBookingSlug } from "./db";

function userRowToBookingBusiness(row: User): BookingBusiness {
  const slug = row.bookingSlug!.trim();
  return {
    name: row.businessName?.trim() || "Business",
    slug,
    description: row.businessDescription?.trim() ?? "",
    timezone: row.businessTimezone?.trim() || "America/Toronto",
    booking_url_active: true,
  };
}

export type PublicBookingCatalogResult =
  | { found: false }
  | { found: true; business: BookingBusiness; appointmentTypes: AppointmentType[] };

export async function getPublicBookingCatalog(slug: string): Promise<PublicBookingCatalogResult> {
  const n = slug.trim().toLowerCase();
  if (!n) {
    return { found: false };
  }

  const row = await getUserByBookingSlug(n);
  if (row?.bookingSlug?.trim()) {
    return {
      found: true,
      business: userRowToBookingBusiness(row),
      appointmentTypes,
    };
  }

  return getDemoCatalogForSlug(slug);
}
