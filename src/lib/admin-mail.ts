import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "admin-smtp.json");

type FileConfig = {
  user?: string;
  pass?: string;
  adminEmail?: string;
};

function fileConfig(): FileConfig {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function getAdminEmail(): string {
  const fc = fileConfig();
  return process.env.ADMIN_EMAIL || fc.adminEmail || "";
}

export function isMailConfigured(): boolean {
  const fc = fileConfig();
  return Boolean(
    process.env.SMTP_USER || process.env.SMTP_PASS || fc.user || fc.pass
  );
}

export async function sendPasswordRecovery(
  toEmail: string,
  password: string
): Promise<void> {
  const fc = fileConfig();
  const user = process.env.SMTP_USER || fc.user || "";
  const pass = process.env.SMTP_PASS || fc.pass || "";
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);

  if (!user || !pass) throw new Error("SMTP not configured");

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transport.sendMail({
    from: `"Chilahati Ladies & Baby Mart" <${user}>`,
    to: toEmail,
    subject: "Password recovery - Chilahati Ladies & Baby Mart",
    text:
      `Hello,\n\n` +
      `You requested your admin password for the Chilahati Ladies & Baby Mart shop.\n\n` +
      `Your admin password is: ${password}\n\n` +
      `Sign in at https://chilahati-baby-mart.onrender.com/admin with your username.\n\n` +
      `If you did not request this, you can ignore this email.\n\n` +
      `- Chilahati Ladies & Baby Mart`,
    html:
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">` +
      `<h2 style="color:#b76e79">Chilahati Ladies &amp; Baby Mart</h2>` +
      `<p>You requested your admin password for the shop.</p>` +
      `<p style="font-size:18px;background:#faf2f2;padding:12px;border-radius:8px"><b>Password:</b> ${password}</p>` +
      `<p>Sign in at <a href="https://chilahati-baby-mart.onrender.com/admin">the admin panel</a> with your username.</p>` +
      `<p style="color:#888;font-size:12px">If you did not request this, you can ignore this email.</p>` +
      `</div>`,
  });
}