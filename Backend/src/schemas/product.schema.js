import z from "zod";
import { extractValidationData } from "../utils/extractErrorData.js";

const createProductSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name is too short" })
    .max(100, { message: "Name is too long" }),
  description: z.string().optional(),
  price: z.number().positive({ message: "Price must be positive" }),
  imageUrl: z.string().url({ message: "Invalid image URL" }).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

const productQuerySchema = z.object({
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  includeVariants: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});

const createVariantSchema = z.object({
  color: z
    .string()
    .min(2, { message: "Color name is too short" })
    .max(50, { message: "Color name is too long" }),
  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, { message: "Invalid hex color" }),
  imageUrl: z.string().url({ message: "Invalid image URL" }).optional().or(z.literal("")),
  stock: z.number().int().min(0, { message: "Stock cannot be negative" }).default(0),
});

const updateVariantSchema = createVariantSchema.partial();

export const validateCreateProduct = (data) => {
  const result = createProductSchema.safeParse(data);
  const { hasError, errorMessages, data: productData } =
    extractValidationData(result);
  return { hasError, errorMessages, productData };
};

export const validateUpdateProduct = (data) => {
  const result = updateProductSchema.safeParse(data);
  const { hasError, errorMessages, data: productData } =
    extractValidationData(result);
  return { hasError, errorMessages, productData };
};

export const validateProductQuery = (data) => {
  const result = productQuerySchema.safeParse(data);
  const { hasError, errorMessages, data: queryData } =
    extractValidationData(result);
  return { hasError, errorMessages, queryData };
};

export const validateCreateVariant = (data) => {
  const result = createVariantSchema.safeParse(data);
  const { hasError, errorMessages, data: variantData } =
    extractValidationData(result);
  return { hasError, errorMessages, variantData };
};

export const validateUpdateVariant = (data) => {
  const result = updateVariantSchema.safeParse(data);
  const { hasError, errorMessages, data: variantData } =
    extractValidationData(result);
  return { hasError, errorMessages, variantData };
};
