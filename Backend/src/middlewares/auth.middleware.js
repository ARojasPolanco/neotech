import { authService } from "../controllers/injection.js";
import { envs } from "../config/enviroments/enviroments.js";
import { AppError, catchAsync } from "../errors/indexError.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in!, Please log in to get access", 401));
  }

  const verifyAsync = promisify(jwt.verify);

  const decoded = await verifyAsync(token, envs.JWT_SECRET);

  const user = await authService.findOneUserById(decoded.id);

  if (!user) {
    return next(new AppError("The owner of this token is not longer available", 401));
  }

  if (user.changedPasswordAt) {
    const changedTimestamp = Math.floor(new Date(user.changedPasswordAt).getTime() / 1000);
    if (decoded.iat < changedTimestamp) {
      return next(new AppError("Password recently changed. Please login again.", 401));
    }
  }

  req.sessionUser = user;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.sessionUser.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};

