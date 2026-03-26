import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { bookingRouter } from "./bookingRouter";
import { settingsRouter } from "./settingsRouter";
import { stripeRouter } from "./stripe";
import { notificationRouter } from "./notifications";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sdk } from "./_core/sdk";
import { upsertUser } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    loginWithSupabase: publicProcedure
      .input(z.object({ accessToken: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";

        if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error("Supabase is not configured on the server.");
        }

        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user }, error } = await adminClient.auth.getUser(input.accessToken);

        if (error || !user) {
          throw new Error("Invalid Supabase token.");
        }

        const openId = `supabase:${user.id}`;
        await upsertUser({
          openId,
          name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
          email: user.email ?? null,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, {
          name: user.user_metadata?.full_name ?? user.email ?? "User",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true } as const;
      }),
  }),

  booking: bookingRouter,
  settings: settingsRouter,
  stripe: stripeRouter,
  notifications: notificationRouter,
});

export type AppRouter = typeof appRouter;
