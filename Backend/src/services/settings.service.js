import cloudinary from "../config/cloudinary.js";
import Setting from "../models/settingModel.js";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export class SettingsService {
  async getSettings() {
    const [settings] = await Setting.findOrCreate({
      where: { id: SETTINGS_ID },
      defaults: {
        id: SETTINGS_ID,
        videoUrl: null,
        videoEnabled: false,
        logoUrl: null,
      },
    });

    return settings;
  }

  async updateSettings(data) {
    const settings = await this.getSettings();
    return settings.update(data);
  }

  async uploadVideo(fileBuffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "neotech/videos",
          resource_type: "video",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      stream.end(fileBuffer);
    });
  }
}
