import { Router } from "express";
import { router as authRouter } from "./authRoutes.js";
import { router as productRouter } from "./productRoutes.js";
import { router as orderRouter } from "./orderRoutes.js";
import { router as paymentRouter } from "./paymentRoutes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/products", productRouter);
router.use("/orders", orderRouter);
router.use("/payments", paymentRouter);
