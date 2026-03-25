import compression from "compression";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { handleStripeWebhook } from "../stripeWebhook";
import { buildRobotsTxt, buildSitemapXml } from "../seo";

const JSON_BODY_LIMIT = "2mb";

export function createExpressApp(): Express {
  const app = express();

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  if (process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
  }

  app.use(helmet({ contentSecurityPolicy: false }));

  if (process.env.NODE_ENV === "production") {
    app.use(compression());
  }

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain; charset=utf-8").send(buildRobotsTxt());
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml; charset=utf-8").send(buildSitemapXml());
  });

  const trpcLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 400 : 5000,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const oauthCallbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Stripe webhook must come before express.json() to receive raw body
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );

  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ limit: JSON_BODY_LIMIT, extended: true }));

  app.use("/api/oauth/callback", oauthCallbackLimiter);
  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    trpcLimiter,
    createExpressMiddleware({ router: appRouter, createContext })
  );

  return app;
}
