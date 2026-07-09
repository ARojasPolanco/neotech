import nodemailer from "nodemailer";
import { envs } from "./enviroments/enviroments.js";

const transporter = nodemailer.createTransport({
  host: envs.SMTP_HOST,
  port: envs.SMTP_PORT,
  secure: false,
  auth: {
    user: envs.SMTP_USER,
    pass: envs.SMTP_PASS,
  },
});

export default transporter;
