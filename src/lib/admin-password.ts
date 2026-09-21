import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "admin-password.json");

export function getStoredPassword(): string | null {
  try {
    if (!fs.existsSync(FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    return typeof parsed.password === "string" ? parsed.password : null;
  } catch {
    return null;
  }
}

export function storePassword(password: string): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    FILE,
    JSON.stringify({ password, updatedAt: new Date().toISOString() }, null, 2),
    "utf-8"
  );
}

export function getAdminPassword(): string {
  return getStoredPassword() || process.env.ADMIN_PASSWORD || "admin123";
}