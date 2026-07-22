import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";
import {
  uploadImage,
  getStats,
  getOrders,
  getOrderById,
  notifyOrder,
} from "../controllers/adminController.js";

export const router = Router();

router.use(protect, restrictTo("ADMIN"));

router.post("/upload", upload.single("image"), uploadImage);
router.get("/stats", getStats);
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.post("/orders/:orderNumber/notify", notifyOrder);
