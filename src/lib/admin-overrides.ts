import fs from "fs";
import path from "path";
import { readJsonFile } from "./data-json";

export type StaticOverride = {
  slug: string;
  name?: string;
  price?: number | null;
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
  const data = readJsonFile<unknown>(OVERRIDES_FILE, {});
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  return data as Record<string, StaticOverride>;
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

export function deleteStaticOverride(slug: string): boolean {
  const overrides = getOverrides();
  if (!(slug in overrides)) return false;
  delete overrides[slug];
  ensureDataDir();
  fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2), "utf-8");
  return true;
}