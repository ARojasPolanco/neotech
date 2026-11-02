import { Router } from "express";
import { validateCode } from "../controllers/discountController.js";

export const router = Router();

router.post("/validate", validateCode);
