import winston from "winston";
import { envs } from "../enviroments/enviroments.js";

let logger;

try {
  const prodFormat = winston.format.json({ timestamp: true });

  const devFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      meta = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      return `${timestamp} ${level}: ${message}${meta}`;
    }),
  );

  const format = envs.NODE_ENV === "development" ? devFormat : prodFormat;

  const isExplicitLogLevel = envs.LOG_LEVEL !== undefined;
  const level = !isExplicitLogLevel && envs.NODE_ENV === "production" ? "info" : envs.LOG_LEVEL;

  logger = winston.createLogger({
    level,
    format,
    transports: [new winston.transports.Console()],
  });
} catch {
  logger = console;
  console.log("Logger initialization failed. Using console as fallback.");
}

export default logger;
