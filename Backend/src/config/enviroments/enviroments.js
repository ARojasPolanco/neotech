import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SSL_ACTIVE: z.enum(["true", "false"]).default("true"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("24h"),
  WEBHOOK_VERIFY_TOKEN: z.string().min(1),
});

export const envs = envSchema.parse(process.env);
