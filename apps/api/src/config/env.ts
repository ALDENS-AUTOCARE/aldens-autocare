import fs from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";

const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "apps/api/.env"),
  path.resolve(__dirname, "../../.env"),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    loadDotenv({ path: envPath, override: false });
    break;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  WEB_APP_URL: z.string().url(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),
  MTN_MOMO_BASE_URL: z.string().url().optional(),
  MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY: z.string().optional(),
  MTN_MOMO_COLLECTION_USER_ID: z.string().optional(),
  MTN_MOMO_COLLECTION_API_SECRET: z.string().optional(),
  MTN_MOMO_TARGET_ENV: z.string().optional(),
  MTN_MOMO_CALLBACK_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
