import { AppError, catchAsync } from "../errors/indexError.js";
import generateJWT from "../config/plugins/generate-jwt.js";
import {
  validateRegister,
  validateLogin,
  validateUpdate,
  validateChangePassword,
} from "../schemas/auth.schema.js";
import { encryptedPassword, verifyPassword } from "../config/plugins/encrypted-password.js";
import { authService } from "./injection.js";

export const changedPassword = catchAsync(async (req, res, next) => {
  const { hasError, errorMessages, userData } = validateChangePassword(req.body);

  if (hasError) {
    return res.status(422).json({
      status: "error",
      message: errorMessages,
    });
  }

  const { currentPassword, newPassword } = userData;

  const { sessionUser } = req;

  if (currentPassword === newPassword) {
    return next(new AppError("The password cannot be equals", 400));
  }

  const isCorrectPassword = await verifyPassword(currentPassword, sessionUser.password);

  if (!isCorrectPassword) {
    return next(new AppError("Incorrect Password", 401));
  }

  const hashedNewPassword = await encryptedPassword(newPassword);

  await authService.updateUser(sessionUser, {
    password: hashedNewPassword,
    changedPasswordAt: new Date(),
  });

  return res.status(200).json({
    status: "success",
    message: "The user password has updated successfully",
  });
});

export const getProfile = catchAsync(async (req, res) => {
  const user = req.sessionUser;

  return res.status(200).json({
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
    acceptedTerms: user.acceptedTerms,
    acceptedMarketing: user.acceptedMarketing,
    termsAcceptedAt: user.termsAcceptedAt,
  });
});

export const updateProfile = catchAsync(async (req, res, _next) => {
  const { hasError, errorMessages, userData } = validateUpdate(req.body);

  if (hasError) {
    return res.status(422).json({
      status: "error",
      message: errorMessages,
    });
  }

  const user = req.sessionUser;

  if (userData.fullname) user.fullname = userData.fullname;
  if (userData.email) user.email = userData.email;

  await user.save();

  return res.status(200).json({
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  });
});

export const register = catchAsync(async (req, res) => {
  const { hasError, errorMessages, userData } = validateRegister(req.body);

  if (hasError) {
    return res.status(422).json({
      status: "error",
      message: errorMessages,
    });
  }

  const user = await authService.createUser({
    ...userData,
    termsAcceptedAt: new Date(),
  });

  const token = await generateJWT(user.id);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { hasError, errorMessages, userData } = validateLogin(req.body);

  if (hasError) {
    return res.status(422).json({
      status: "error",
      message: errorMessages,
    });
  }

  const userEmail = await authService.findOneUserByEmail(userData.email);

  if (!userEmail) {
    return next(new AppError("Email or password invalid", 401));
  }

  const isCorrectPassword = await verifyPassword(userData.password, userEmail.password);

  if (!isCorrectPassword) {
    return next(new AppError("Email or password invalid", 401));
  }

  const token = await generateJWT(userEmail.id);

  return res.status(200).json({
    token,
    user: {
      id: userEmail.id,
      fullname: userEmail.fullname,
      email: userEmail.email,
      role: userEmail.role,
    },
  });
});
