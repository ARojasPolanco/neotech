import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";

export const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
