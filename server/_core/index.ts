import "dotenv/config";
import { createServer } from "http";
import net from "net";
import { createExpressApp } from "./app";
import { serveStatic, setupVite } from "./vite";
import { logProductionWarnings } from "./productionChecks";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET?.trim()) {
  throw new Error("JWT_SECRET must be set in production");
}

logProductionWarnings();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function resolveListenPort(preferred: number): Promise<number> {
  if (process.env.NODE_ENV === "production") {
    if (!(await isPortAvailable(preferred))) {
      throw new Error(`Port ${preferred} is not available in production.`);
    }
    return preferred;
  }
  return findAvailablePort(preferred);
}

async function startServer() {
  const app = createExpressApp();
  const server = createServer(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferred = parseInt(process.env.PORT || "3000", 10);
  const port = await resolveListenPort(preferred);

  if (process.env.NODE_ENV !== "production" && port !== preferred) {
    console.log(`Port ${preferred} is busy, using port ${port} instead`);
  }

  const host = process.env.HOST?.trim() || "0.0.0.0";

  server.listen(port, host, () => {
    const publicUrl =
      process.env.PUBLIC_SITE_URL?.trim() ||
      process.env.SITE_URL?.trim() ||
      `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`;
    console.log(`Server listening on http://${host}:${port}/ (NODE_ENV=${process.env.NODE_ENV ?? "undefined"})`);
    console.log(`Health check: ${publicUrl.replace(/\/$/, "")}/health`);
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down…`);
    server.close(err => {
      if (err) { console.error(err); process.exit(1); }
      process.exit(0);
    });
    setTimeout(() => { console.error("Forced exit after shutdown timeout"); process.exit(1); }, 10_000).unref();
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
