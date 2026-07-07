import { AppError } from "../errors/appError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const messages = result.error.issues
        .map((issue) => issue.message)
        .join(". ");
      return next(new AppError(messages, 422));
    }

    req.body = result.data;
    next();
  };
};
