import nodemailer from "nodemailer";
import dns from "dns";
import { envs } from "./enviroments/enviroments.js";

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: envs.SMTP_HOST,
  port: envs.SMTP_PORT,
  secure: false,
  auth: {
    user: envs.SMTP_USER,
    pass: envs.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

export default transporter;