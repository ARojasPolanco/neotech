import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";
import { validateUUID } from "../middlewares/validateUUID.middleware.js";
import {
  uploadImage,
  getStats,
  getOrders,
  getOrderById,
  notifyOrder,
  createDiscountCode,
  getDiscountCodes,
  updateDiscountCode,
  getDiscountCampaigns,
  createDiscountCampaign,
  endDiscountCampaign,
} from "../controllers/adminController.js";

export const router = Router();

router.use(protect, restrictTo("ADMIN"));

router.post("/upload", upload.single("image"), uploadImage);
router.get("/stats", getStats);
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.post("/orders/:orderNumber/notify", notifyOrder);

router.get("/discount-codes", getDiscountCodes);
router.post("/discount-codes", createDiscountCode);
router.patch("/discount-codes/:id", validateUUID("id"), updateDiscountCode);

router.get("/discount-campaigns", getDiscountCampaigns);
router.post("/discount-campaigns", createDiscountCampaign);
router.post(
  "/discount-campaigns/:id/end",
  validateUUID("id"),
  endDiscountCampaign,
);
