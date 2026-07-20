import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { router } from "./routes/routes.js";
import { globalErrorHandler } from "./errors/error.controller.js";
import { envs } from "./config/enviroments/enviroments.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

const rawOrigin = process.env.CORS_ORIGIN || "";

const corsOrigin = envs.NODE_ENV === "production" && rawOrigin
  ? function (origin, callback) {
      const allowed = [rawOrigin];
      // Also allow www. and non-www. variants
      if (rawOrigin.includes("://")) {
        const url = new URL(rawOrigin);
        const apex = url.hostname.replace(/^www\./, "");
        allowed.push(`${url.protocol}//${apex}`);
        if (!url.hostname.startsWith("www.")) {
          allowed.push(`${url.protocol}//www.${apex}`);
        }
      }
      if (!origin || allowed.some((a) => origin.startsWith(a))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  : true;

app.use(cors({ origin: corsOrigin }));

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: envs.NODE_ENV === "test" ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "fail", message: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: envs.NODE_ENV === "test" ? 10000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "fail", message: "Too many login attempts, please try again later" },
  skipFailedRequests: true,
});

app.use("/api/v1", globalLimiter);
app.use("/api/v1/auth/login", authLimiter);

app.use(express.json());

app.use("/api/v1", router);

app.use(globalErrorHandler);

export default app;
