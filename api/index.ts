import "dotenv/config";
import { createExpressApp } from "../server/_core/app";

/** Vercel serverless entry: same Express app as Node `pnpm start`. */
export default createExpressApp();
