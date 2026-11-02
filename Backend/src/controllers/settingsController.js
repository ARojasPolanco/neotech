import { AppError, catchAsync } from "../errors/indexError.js";
import { validateUpdateSettings } from "../schemas/settings.schema.js";
import { SettingsService } from "../services/settings.service.js";

const settingsService = new SettingsService();

export const getSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.getSettings();
  return res.status(200).json(settings);
});

export const getSiteSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.getSettings();

  return res.status(200).json({
    videoUrl: settings.videoUrl,
    videoEnabled: settings.videoEnabled,
    logoUrl: settings.logoUrl,
  });
});

export const updateSettings = catchAsync(async (req, res) => {
  const { hasError, errorMessages, settingsData } = validateUpdateSettings(
    req.body,
  );

  if (hasError) {
    return res.status(422).json({ status: "error", message: errorMessages });
  }

  const settings = await settingsService.updateSettings(settingsData);
  return res.status(200).json(settings);
});

export const uploadVideo = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No se envió ningún video", 400));
  }

  const url = await settingsService.uploadVideo(req.file.buffer);
  return res.status(200).json({ url });
});
