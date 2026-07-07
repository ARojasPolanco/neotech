import { Router } from "express";
import { router as authRouter } from "./authRoutes.js";
import { router as productRouter } from "./productRoutes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/products", productRouter);
