import { validate as isUUID } from "uuid";
import { AppError } from "../errors/appError.js";

export const validateUUID = (paramName = "id") => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!isUUID(value)) {
      return next(new AppError("Invalid resource identifier", 400));
    }
    next();
  };
};
