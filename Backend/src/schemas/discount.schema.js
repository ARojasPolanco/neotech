import z from "zod";
import { extractValidationData } from "../utils/extractErrorData.js";

const createDiscountCodeSchema = z.object({
  discountPercent: z.coerce.number().min(1).max(100),
  maxUses: z.coerce
    .number()
    .int()
    .refine((value) => value === 1 || value === 10, {
      message: "Los usos deben ser 1 o 10",
    }),
  expiresInHours: z.coerce
    .number()
    .int()
    .refine((value) => [24, 48, 72].includes(value), {
      message: "El vencimiento debe ser 24, 48 o 72 horas",
    }),
  code: z.string().min(3).max(30).optional(),
});

const updateDiscountCodeSchema = z.object({
  isActive: z.boolean(),
});

const validateDiscountCodeSchema = z.object({
  code: z.string().min(3).max(30),
});

const createDiscountCampaignSchema = z.object({
  name: z.string().min(2).max(100),
  discountPercent: z.coerce.number().min(1).max(100),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .refine((value) => !value || new Date(value) > new Date(), {
      message: "La fecha de vencimiento debe ser futura",
    }),
  productIds: z.array(z.string().uuid()).min(1, {
    message: "Seleccioná al menos un producto",
  }),
});

export const validateCreateDiscountCode = (data) => {
  const result = createDiscountCodeSchema.safeParse(data);
  const { hasError, errorMessages, data: codeData } =
    extractValidationData(result);
  return { hasError, errorMessages, codeData };
};

export const validateUpdateDiscountCode = (data) => {
  const result = updateDiscountCodeSchema.safeParse(data);
  const { hasError, errorMessages, data: codeData } =
    extractValidationData(result);
  return { hasError, errorMessages, codeData };
};

export const validateDiscountCode = (data) => {
  const result = validateDiscountCodeSchema.safeParse(data);
  const { hasError, errorMessages, data: codeData } =
    extractValidationData(result);
  return { hasError, errorMessages, codeData };
};

export const validateCreateDiscountCampaign = (data) => {
  const result = createDiscountCampaignSchema.safeParse(data);
  const { hasError, errorMessages, data: campaignData } =
    extractValidationData(result);
  return { hasError, errorMessages, campaignData };
};
