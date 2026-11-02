import multer from "multer";
import { AppError } from "../errors/appError.js";

const storage = multer.memoryStorage();

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const videoMimeTypes = ["video/mp4", "video/webm"];

const imageFileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Tipo de archivo no permitido. Solo imágenes JPEG, PNG, WebP o GIF.",
        400,
      ),
    );
  }
};

export const videoFileFilter = (req, file, cb) => {
  if (videoMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Tipo de archivo no permitido. Solo videos MP4 o WebM.",
        400,
      ),
    );
  }
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});
