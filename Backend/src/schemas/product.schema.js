import z from "zod";
import { extractValidationData } from "../utils/extractErrorData.js";

const createProductSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name is too short" })
    .max(100, { message: "Name is too long" }),
  description: z.string().optional(),
  price: z
    .number()
    .positive({ message: "Price must be positive" }),
  stock: z
    .number()
    .int()
    .min(0, { message: "Stock cannot be negative" }),
  imageUrl: z.string().url({ message: "Invalid image URL" }).optional(),
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
});

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
