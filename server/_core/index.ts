import "dotenv/config";
import compression from "compression";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripeWebhook";
import { buildRobotsTxt, buildSitemapXml } from "../seo";
import { logProductionWarnings } from "./productionChecks";

const JSON_BODY_LIMIT = "2mb";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET?.trim()) {
  throw new Error("JWT_SECRET must be set in production");
}

logProductionWarnings();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function resolveListenPort(preferredPort: number): Promise<number> {
  if (process.env.NODE_ENV === "production") {
    const available = await isPortAvailable(preferredPort);
    if (!available) {
      throw new Error(
        `Port ${preferredPort} is not available. In production the PORT must be free (or change PORT).`
      );
    }
    return preferredPort;
  }
  return findAvailablePort(preferredPort);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  if (process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

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

  // Stripe webhook MUST be registered BEFORE express.json() middleware
  // to receive raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );

  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ limit: JSON_BODY_LIMIT, extended: true }));

  app.use("/api/oauth/callback", oauthCallbackLimiter);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    trpcLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000", 10);
  const port = await resolveListenPort(preferredPort);

  if (process.env.NODE_ENV !== "production" && port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  const host = process.env.HOST?.trim() || "0.0.0.0";

  server.listen(port, host, () => {
    const publicUrl =
      process.env.PUBLIC_SITE_URL?.trim() ||
      process.env.SITE_URL?.trim() ||
      `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`;
    console.log(
      `Server listening on http://${host}:${port}/ (NODE_ENV=${process.env.NODE_ENV ?? "undefined"})`
    );
    console.log(`Health check: ${publicUrl.replace(/\/$/, "")}/health`);
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down…`);
    server.close(err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forced exit after shutdown timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
