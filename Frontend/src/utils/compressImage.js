import imageCompression from "browser-image-compression";

const options = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
};

export async function compressImage(file) {
  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (error) {
    console.error("Error al comprimir imagen:", error);
    return file;
  }
}
