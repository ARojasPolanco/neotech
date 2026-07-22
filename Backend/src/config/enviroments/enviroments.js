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
  MP_ACCESS_TOKEN: z.string().min(1),
  MP_PUBLIC_KEY: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  OWNER_EMAIL: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  MP_WEBHOOK_SECRET: z.string().min(1),
  BASE_URL: z.string().url().optional(),
  WHATSAPP_OWNER_NUMBER: z.string().min(1),
});

export const envs = envSchema.parse(process.env);
