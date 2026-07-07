import { Router } from "express";
import { router as authRouter } from "./authRoutes.js";

export const router = Router();

router.use("/auth", authRouter);
