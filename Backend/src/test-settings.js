import {
  ok,
  rechazo,
  fallo,
  resetCounters,
  callHandler,
  printResumen,
} from "./test-utils.js";
import sequelize from "./config/database/database.js";
import "./models/settingModel.js";
import { SettingsService } from "./services/settings.service.js";
import { videoFileFilter } from "./middlewares/upload.js";
import {
  getSettings,
  getSiteSettings,
  updateSettings,
} from "./controllers/settingsController.js";

export async function runSettingsTests() {
  resetCounters();
  console.log("\n--- Settings Tests ---\n");

  await sequelize.sync({ alter: true });

  const service = new SettingsService();
  await service.updateSettings({
    videoUrl: null,
    videoEnabled: false,
    logoUrl: null,
  });

  const defaults = await callHandler(getSettings, {});

  if (defaults.statusCode === 200 && defaults.body.videoEnabled === false) {
    ok("Settings defaults loaded");
  } else {
    fallo("Settings defaults failed", defaults.body);
  }

  const videoUrl = "https://example.com/neotech-video.mp4";
  const updated = await callHandler(updateSettings, {
    videoUrl,
    videoEnabled: true,
  });

  if (
    updated.statusCode === 200 &&
    updated.body.videoUrl === videoUrl &&
    updated.body.videoEnabled === true
  ) {
    ok("Settings updated with video");
  } else {
    fallo("Settings update failed", updated.body);
  }

  const site = await callHandler(getSiteSettings, {});

  if (
    site.statusCode === 200 &&
    site.body.videoUrl === videoUrl &&
    site.body.videoEnabled === true
  ) {
    ok("Public site settings return the video config");
  } else {
    fallo("Public site settings failed", site.body);
  }

  const invalid = await callHandler(updateSettings, {
    videoUrl: "not-a-url",
  });

  if (invalid.statusCode === 422) {
    rechazo("Invalid video URL rejected");
  } else {
    fallo("Invalid video URL should return 422", invalid.body);
  }

  await new Promise((resolve) => {
    videoFileFilter({}, { mimetype: "video/mp4" }, (err, accepted) => {
      if (!err && accepted) {
        ok("MP4 video accepted by the upload filter");
      } else {
        fallo("MP4 video rejected by the upload filter", err?.message);
      }
      resolve();
    });
  });

  await new Promise((resolve) => {
    videoFileFilter({}, { mimetype: "image/png" }, (err) => {
      if (err) {
        rechazo("Non-video file rejected by the upload filter");
      } else {
        fallo("Non-video file accepted by the upload filter");
      }
      resolve();
    });
  });

  await service.updateSettings({
    videoUrl: null,
    videoEnabled: false,
    logoUrl: null,
  });

  printResumen();
}
