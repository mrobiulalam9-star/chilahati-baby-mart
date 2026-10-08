import fs from "fs";
import path from "path";
import { readJsonFile } from "./data-json";
import { liveJson } from "./live-sync";

const DATA_DIR = path.join(process.cwd(), "data");
const HIDDEN_FILE = path.join(DATA_DIR, "hidden-products.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readHidden(): string[] {
  ensureDataDir();
  const local = readJsonFile<unknown>(HIDDEN_FILE, []);
  const localList = Array.isArray(local)
    ? local.filter((s): s is string => typeof s === "string")
    : [];

  const remote = liveJson<unknown>("data/hidden-products.json");
  if (!remote || !Array.isArray(remote)) return localList;
  const remoteList = remote.filter((s): s is string => typeof s === "string");
  return Array.from(new Set([...remoteList, ...localList]));
}

function writeHidden(slugs: string[]) {
  ensureDataDir();
  fs.writeFileSync(HIDDEN_FILE, JSON.stringify(slugs, null, 2), "utf-8");
}

export function getHiddenSlugs(): string[] {
  return readHidden();
}

export function hideProduct(slug: string): boolean {
  const hidden = readHidden();
  if (hidden.includes(slug)) return false;
  hidden.push(slug);
  writeHidden(hidden);
  return true;
}

export function unhideProduct(slug: string): boolean {
  const hidden = readHidden();
  const index = hidden.indexOf(slug);
  if (index === -1) return false;
  hidden.splice(index, 1);
  writeHidden(hidden);
  return true;
}
