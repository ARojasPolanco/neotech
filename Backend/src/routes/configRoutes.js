import { Router } from "express";

export const router = Router();

router.get("/whatsapp", (req, res) => {
  const number = process.env.WHATSAPP_OWNER_NUMBER || "54911XXXXXXXX";
  return res.status(200).json({ number });
});
