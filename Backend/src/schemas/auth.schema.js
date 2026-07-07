import z from "zod";
import { extractValidationData } from "../utils/extractErrorData.js";

const userSchema = z.object({
  fullname: z
    .string()
    .min(3, { message: "Name is too short" })
    .max(50, { message: "Name is too long" }),
  email: z.string().email({ message: "Invalid type" }),
  password: z.string().min(8, { message: "Password is too short" }),
  role: z.enum(["ADMIN", "CLIENT"]).default("CLIENT"),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, "Debe aceptar los términos y condiciones"),
  acceptedMarketing: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid type" }),
  password: z.string().min(8, { message: "Password is too short" }),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export const validateRegister = (data) => {
  const result = userSchema.safeParse(data);

  const { hasError, errorMessages, data: userData } = extractValidationData(result);

  return {
    hasError,
    errorMessages,
    userData,
  };
};

export const validateUpdate = (data) => {
  const result = userSchema.partial().safeParse(data);

  const { hasError, errorMessages, data: userData } = extractValidationData(result);

  return {
    hasError,
    errorMessages,
    userData,
  };
};

export const validateLogin = (data) => {
  const result = loginSchema.safeParse(data);

  const { hasError, errorMessages, data: userData } = extractValidationData(result);

  return {
    hasError,
    errorMessages,
    userData,
  };
};

export const validateChangePassword = (data) => {
  const result = changePasswordSchema.safeParse(data);

  const { hasError, errorMessages, data: userData } = extractValidationData(result);

  return {
    hasError,
    errorMessages,
    userData,
  };
};
