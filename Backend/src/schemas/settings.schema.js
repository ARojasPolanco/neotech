import z from "zod";
import { extractValidationData } from "../utils/extractErrorData.js";

const updateSettingsSchema = z.object({
  videoUrl: z.string().url().optional().nullable(),
  videoEnabled: z.boolean().optional(),
  logoUrl: z.string().url().optional().nullable(),
});

export const validateUpdateSettings = (data) => {
  const result = updateSettingsSchema.safeParse(data);
  const { hasError, errorMessages, data: settingsData } =
    extractValidationData(result);
  return { hasError, errorMessages, settingsData };
};
