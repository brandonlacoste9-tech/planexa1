import { publicProcedure, router } from "./_core/trpc";
import { getPublicBookingCatalog } from "./publicBookingCatalog";
import { z } from "zod";

export const bookingRouter = router({
  getCatalog: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => getPublicBookingCatalog(input.slug)),
});
