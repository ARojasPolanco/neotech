import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

export const router = Router();

router.get("/", findAllProducts);
router.get("/:id", findProductById);
router.post("/", protect, restrictTo("ADMIN"), createProduct);
router.patch("/:id", protect, restrictTo("ADMIN"), updateProduct);
router.delete("/:id", protect, restrictTo("ADMIN"), deleteProduct);
