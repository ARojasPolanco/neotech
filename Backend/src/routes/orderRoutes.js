import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getOrder,
  getMyOrders,
  getOrderByNumber,
} from "../controllers/orderController.js";

export const router = Router();

router.post("/", createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/number/:orderNumber", getOrderByNumber);
router.get("/:id", getOrder);
