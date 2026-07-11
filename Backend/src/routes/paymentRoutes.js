import { Router } from "express";
import {
  createPreference,
  webhookHandler,
  verifyPayment,
  simulatePayment,
} from "../controllers/paymentController.js";

export const router = Router();

router.post("/create-preference", createPreference);
router.post("/webhook", webhookHandler);
router.get("/verify/:orderNumber", verifyPayment);
router.post("/simulate/:orderNumber", simulatePayment);
