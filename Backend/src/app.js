import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { router } from "./routes/routes.js";
import { globalErrorHandler } from "./errors/error.controller.js";
import { envs } from "./config/enviroments/enviroments.js";

const app = express();

app.use(helmet());
app.use(cors());

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
