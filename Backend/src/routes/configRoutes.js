import { Router } from "express";
import { envs } from "../config/enviroments/enviroments.js";
import { getSiteSettings } from "../controllers/settingsController.js";

export const router = Router();

router.get("/whatsapp", (req, res) => {
  return res.status(200).json({ number: envs.WHATSAPP_OWNER_NUMBER });
});

router.get("/site", getSiteSettings);
