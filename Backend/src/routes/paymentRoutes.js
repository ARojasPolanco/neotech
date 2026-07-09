import { Router } from "express";
import {
  createPreference,
  webhookHandler,
} from "../controllers/paymentController.js";

export const router = Router();

router.post("/create-preference", createPreference);
router.post("/webhook", webhookHandler);
