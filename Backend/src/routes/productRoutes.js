import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import {
  findAllProducts,
  findProductById,
  findFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/productController.js";

export const router = Router();

router.get("/", findAllProducts);
router.get("/featured", findFeaturedProducts);
router.get("/:id", findProductById);
router.get("/:id/variants", getProductVariants);
router.post("/", protect, restrictTo("ADMIN"), createProduct);
router.post("/:id/variants", protect, restrictTo("ADMIN"), createVariant);
router.patch("/:id", protect, restrictTo("ADMIN"), updateProduct);
router.patch("/variants/:id", protect, restrictTo("ADMIN"), updateVariant);
router.delete("/:id", protect, restrictTo("ADMIN"), deleteProduct);
router.delete("/variants/:id", protect, restrictTo("ADMIN"), deleteVariant);
