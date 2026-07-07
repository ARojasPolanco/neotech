import { envs } from "../config/enviroments/enviroments.js";
import Error from "../errors/error.model.js";
import logger from "../config/logger/logger.js";
import errorMatchers from "./errorMatchers.js";

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
  logger.error({
    message: err.message,
    status: err.status,
    stack: err.stack,
  });
};

const sendErrorProd = async (err, req, res) => {
  await Error.create({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });

  logger.error({
    message: err.message,
    stack: err.stack,
    ip: req.ip,
    user: req.sessionUser?.email || "anonymous",
    isOperational: err.isOperational,
  });

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    logger.error({
      message: err.message,
      status: err.status,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      status: "fail",
      message: "Something went very wrong!",
    });
    logger.fatal({
      message: err.message,
      status: err.status,
      stack: err.stack,
    });
  }
};

// Necesario para que Express reconozca este middleware como un manejador de errores global
// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  if (envs.NODE_ENV === "development") {
    return sendErrorDev(err, req, res);
  }

  if (envs.NODE_ENV === "production") {
    const matcher = errorMatchers.find((m) => m.test(err));
    const error = matcher ? matcher.handle(err, req) : err;
    return sendErrorProd(error, req, res);
  }
};
