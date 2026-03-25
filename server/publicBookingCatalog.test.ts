import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPublicBookingCatalog } from "./publicBookingCatalog";
import * as db from "./db";

vi.mock("./db", () => ({
  getUserByBookingSlug: vi.fn(),
}));

describe("getPublicBookingCatalog", () => {
  beforeEach(() => {
    vi.mocked(db.getUserByBookingSlug).mockResolvedValue(undefined);
  });

  it("returns demo catalog for known demo slug", async () => {
    const r = await getPublicBookingCatalog("jmitchell");
    expect(r.found).toBe(true);
    if (r.found) {
      expect(r.business.slug).toBe("jmitchell");
      expect(r.appointmentTypes.length).toBeGreaterThan(0);
    }
  });

  it("returns not found for unknown slug when DB has no row", async () => {
    const r = await getPublicBookingCatalog("unknown-brand");
    expect(r.found).toBe(false);
  });
});
