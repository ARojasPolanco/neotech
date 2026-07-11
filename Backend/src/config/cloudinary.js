import { v2 as cloudinary } from "cloudinary";
import { envs } from "./enviroments/enviroments.js";

cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET,
});

export default cloudinary;
