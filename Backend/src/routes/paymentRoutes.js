import { Router } from "express";
import {
  createPreference,
  webhookHandler,
  verifyPayment,
  simulatePayment,
  resendNotifications,
  sendTestEmail,
} from "../controllers/paymentController.js";

export const router = Router();

router.post("/create-preference", createPreference);
router.post("/webhook", webhookHandler);
router.get("/verify/:orderNumber", verifyPayment);
router.post("/simulate/:orderNumber", simulatePayment);
router.post("/resend/:orderNumber", resendNotifications);
router.post("/test-email", sendTestEmail);
