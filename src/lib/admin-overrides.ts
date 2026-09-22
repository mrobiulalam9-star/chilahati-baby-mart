import fs from "fs";
import path from "path";

export type StaticOverride = {
  slug: string;
  name?: string;
  price?: number;
  oldPrice?: number;
  ages?: string[];
  sizes?: string[];
  colors?: string[];
  description?: string;
  featured?: boolean;
  images?: string[];
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const OVERRIDES_FILE = path.join(DATA_DIR, "overrides.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getOverrides(): Record<string, StaticOverride> {
  ensureDataDir();
  if (!fs.existsSync(OVERRIDES_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(OVERRIDES_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function setStaticOverride(
  slug: string,
  updates: Partial<Omit<StaticOverride, "slug" | "updatedAt">>
): StaticOverride {
  const overrides = getOverrides();
  const existing = overrides[slug] || { slug, updatedAt: new Date(0).toISOString() };
  const next: StaticOverride = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  overrides[slug] = next;
  ensureDataDir();
  fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2), "utf-8");
  return next;
}