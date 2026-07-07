import { AppError } from "./appError.js";
import logger from "../config/logger/logger.js";

const handleCastError22001 = () =>
  new AppError("value too long for type on attribute in database", 400);

const handleCastError23505 = () =>
  new AppError("Llave duplicada: Por favor introduce otro valor", 400);

const handleCastError22P02 = () => new AppError("Invalid data type in database", 400);

const handleCastError23503 = () => new AppError("Foreign key constraint violation", 400);

const handleSequelizeUniqueConstraintError = (err, req) => {
  const fields = Object.keys(err.fields).join(", ");
  logger.error({
    ip: req.ip,
    user: req.sessionUser?.email || "anonymous",
    message: `Unique constraint violation on field(s): ${fields}`,
  });
  return new AppError(`The field '${fields}' already exists.`, 400);
};

const handleSequelizeValidationError = (err, req) => {
  const messages = err.errors.map((e) => e.message).join(". ");
  logger.error({
    ip: req.ip,
    user: req.sessionUser?.email || "anonymous",
    message: `Validation error: ${messages}`,
  });
  return new AppError(messages, 400);
};

const handleJWTExpiredError = () => new AppError("Your token has expired. Please login again", 401);

const handleJWTError = () => new AppError("Invalid token. Please login again", 401);

const handleMulterError = (err) => new AppError(`File upload error: ${err.message}`, 400);

// eslint-disable-next-line no-unused-vars
const handleZodError = (err, req) => {
  const issues = err.issues || err.errors || [];
  const messages = issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  return new AppError(messages || "Validation failed", 422);
};

const errorMatchers = [
  {
    test: (e) => e.name === "SequelizeUniqueConstraintError",
    handle: handleSequelizeUniqueConstraintError,
  },
  {
    test: (e) => e.name === "SequelizeValidationError",
    handle: handleSequelizeValidationError,
  },
  {
    test: (e) => e.parent?.code === "22001",
    handle: () => handleCastError22001(),
  },
  {
    test: (e) => e.parent?.code === "23505",
    handle: () => handleCastError23505(),
  },
  {
    test: (e) => e.parent?.code === "22P02",
    handle: () => handleCastError22P02(),
  },
  {
    test: (e) => e.parent?.code === "23503",
    handle: () => handleCastError23503(),
  },
  {
    test: (e) => e.name === "TokenExpiredError",
    handle: () => handleJWTExpiredError(),
  },
  {
    test: (e) => e.name === "JsonWebTokenError",
    handle: () => handleJWTError(),
  },
  { test: (e) => e.name === "ZodError", handle: handleZodError },
  {
    test: (e) => e.name === "MulterError",
    handle: handleMulterError,
  },
];

export default errorMatchers;

export {
  handleCastError22001,
  handleCastError23505,
  handleCastError22P02,
  handleCastError23503,
  handleSequelizeUniqueConstraintError,
  handleSequelizeValidationError,
  handleJWTExpiredError,
  handleJWTError,
  handleMulterError,
  handleZodError,
};
