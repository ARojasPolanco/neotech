import { AppError, catchAsync } from "../errors/indexError.js";
import { ProductService } from "../services/product.services.js";
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery,
  validateCreateVariant,
  validateUpdateVariant,
} from "../schemas/product.schema.js";

const productService = new ProductService();

export const findAllProducts = catchAsync(async (req, res) => {
  const { hasError, errorMessages, queryData } = validateProductQuery(
    req.query,
  );

  if (hasError) {
    return res.status(422).json({
      status: "error",
      message: errorMessages,
    });
  }

  const products = await productService.findAll(queryData);
  return res.status(200).json(products);
});

export const findProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await productService.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  return res.status(200).json(product);
});

export const findFeaturedProducts = catchAsync(async (req, res) => {
  const products = await productService.findFeatured(6);
  return res.status(200).json(products);
});

export const createProduct = catchAsync(async (req, res) => {
  const { hasError, errorMessages, productData } = validateCreateProduct(
    req.body,
  );

  if (hasError) {
    return res.status(422).json({
      status: "error",
      message: errorMessages,
    });
  }

  const product = await productService.create(productData);
  return res.status(201).json(product);
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await productService.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const { hasError, errorMessages, productData } = validateUpdateProduct(
    req.body,
  );

  if (hasError) {
    return res.status(422).json({
      status: "error",
      message: errorMessages,
    });
  }

  const updatedProduct = await productService.update(product, productData);
  return res.status(200).json(updatedProduct);
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await productService.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  await productService.disable(product);
  return res.status(200).json({
    status: "success",
    message: "Product disabled successfully",
  });
});

export const permanentDeleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await productService.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  try {
    await productService.permanentDelete(product);
    return res.status(200).json({
      status: "success",
      message: "Product permanently deleted",
    });
  } catch (err) {
    if (err.message === "PRODUCT_HAS_ORDERS") {
      return next(
        new AppError(
          "No se puede eliminar: el producto tiene pedidos asociados. Desactivalo en su lugar.",
          409,
        ),
      );
    }
    throw err;
  }
});

export const getProductVariants = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await productService.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const variants = await productService.getVariants(id);
  return res.status(200).json(variants);
});

export const createVariant = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await productService.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  const { hasError, errorMessages, variantData } = validateCreateVariant(
    req.body,
  );

  if (hasError) {
    return res.status(422).json({
      status: "error",
      message: errorMessages,
    });
  }

  const variant = await productService.createVariant(id, variantData);
  return res.status(201).json(variant);
});

export const updateVariant = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const variant = await productService.getVariant(id);

  if (!variant) {
    return next(new AppError("Variant not found", 404));
  }

  const { hasError, errorMessages, variantData } = validateUpdateVariant(
    req.body,
  );

  if (hasError) {
    return res.status(422).json({
      status: "error",
      message: errorMessages,
    });
  }

  const updatedVariant = await productService.updateVariant(variant, variantData);
  return res.status(200).json(updatedVariant);
});

export const deleteVariant = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const variant = await productService.getVariant(id);

  if (!variant) {
    return next(new AppError("Variant not found", 404));
  }

  await productService.deleteVariant(variant);
  return res.status(200).json({
    status: "success",
    message: "Variant deleted successfully",
  });
});
