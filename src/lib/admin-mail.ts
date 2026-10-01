import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { formatPrice } from "./site";
import type { Order } from "./order-store";

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Emails the shop owner as soon as a customer places an order. Resolves quietly
 * when SMTP is not configured, so a fresh install works without mail settings.
 */
export async function sendNewOrderNotification(order: Order): Promise<void> {
  if (!isMailConfigured()) return;
  const to = getAdminEmail();
  if (!to) return;

  const fc = fileConfig();
  const user = process.env.SMTP_USER || fc.user || "";
  const pass = process.env.SMTP_PASS || fc.pass || "";
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const deliveryLabel = order.customer.deliveryType === "store" ? "Store pickup" : "Home delivery";
  const lines = order.items.map((item) => {
    const amount = item.lineTotal === null ? "Price on request" : formatPrice(item.lineTotal);
    const variant = [item.size, item.color].filter(Boolean).join(" / ");
    return `${item.quantity} x ${item.name}${variant ? ` (${variant})` : ""} — ${amount}`;
  });
  const totalLabel = order.hasUnpricedItems
    ? `${formatPrice(order.total)} + items on request`
    : formatPrice(order.total);

  const textBody =
    `New order ${order.orderNo}\n\n` +
    `Customer: ${order.customer.name}\n` +
    `Phone: ${order.customer.phone}\n` +
    `Delivery: ${deliveryLabel}\n` +
    `Address: ${order.customer.address}\n` +
    (order.customer.note ? `Note: ${order.customer.note}\n` : "") +
    `\nItems:\n${lines.map((l) => `- ${l}`).join("\n")}\n\n` +
    `Subtotal: ${formatPrice(order.subtotal)}\n` +
    `Delivery charge: ${formatPrice(order.deliveryCharge)}\n` +
    `Total: ${totalLabel}\n\n` +
    `Manage this order in the admin panel: /admin/orders`;

  const rows = order.items
    .map(
      (item) =>
        `<tr>` +
        `<td style="padding:6px 8px;border-bottom:1px solid #f2e3dc">${item.quantity} x ${escapeHtml(item.name)}` +
        `${item.size ? `<br/><span style="color:#97838a;font-size:12px">Size: ${escapeHtml(item.size)}</span>` : ""}` +
        `${item.color ? `<br/><span style="color:#97838a;font-size:12px">Colour: ${escapeHtml(item.color)}</span>` : ""}` +
        `</td>` +
        `<td style="padding:6px 8px;border-bottom:1px solid #f2e3dc;text-align:right;white-space:nowrap">` +
        `${item.lineTotal === null ? "On request" : escapeHtml(formatPrice(item.lineTotal))}</td></tr>`
    )
    .join("");

  const htmlBody =
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#3b2a33">` +
    `<h2 style="color:#b8526f;margin:0 0 4px">New order ${escapeHtml(order.orderNo)}</h2>` +
    `<p style="color:#97838a;font-size:13px;margin:0 0 16px">Placed ${escapeHtml(order.createdAt)}</p>` +
    `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>` +
    `<p style="margin:16px 0 4px">Subtotal: <b>${escapeHtml(formatPrice(order.subtotal))}</b><br/>` +
    `Delivery charge: ${escapeHtml(formatPrice(order.deliveryCharge))} (${deliveryLabel})<br/>` +
    `Total: <b style="font-size:17px">${escapeHtml(totalLabel)}</b></p>` +
    `<div style="background:#faf2f2;padding:12px;border-radius:8px;margin-top:16px;font-size:14px">` +
    `<b>${escapeHtml(order.customer.name)}</b><br/>` +
    `Phone: ${escapeHtml(order.customer.phone)}<br/>` +
    `${order.customer.deliveryType === "store" ? "Store pickup" : `Address: ${escapeHtml(order.customer.address)}`}` +
    `${order.customer.note ? `<br/>Note: ${escapeHtml(order.customer.note)}` : ""}` +
    `</div>` +
    `</div>`;

  await transport.sendMail({
    from: `"Chilahati Ladies & Baby Mart" <${user}>`,
    to,
    subject: `New order ${order.orderNo} — ${escapeHtml(order.customer.name)}`,
    text: textBody,
    html: htmlBody,
  });
}