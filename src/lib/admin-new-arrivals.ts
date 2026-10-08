import fs from "fs";
import path from "path";
import { readJsonFile } from "./data-json";
import { liveJson } from "./live-sync";

const DATA_DIR = path.join(process.cwd(), "data");
const NEW_ARRIVALS_FILE = path.join(DATA_DIR, "new-arrivals.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readNewArrivals(): string[] {
  ensureDataDir();
  const local = readJsonFile<unknown>(NEW_ARRIVALS_FILE, []);
  const localList = Array.isArray(local)
    ? local.filter((s): s is string => typeof s === "string")
    : [];

  const remote = liveJson<unknown>("data/new-arrivals.json");
  if (!remote || !Array.isArray(remote)) return localList;
  const remoteList = remote.filter((s): s is string => typeof s === "string");
  return Array.from(new Set([...remoteList, ...localList]));
}

function writeNewArrivals(slugs: string[]) {
  ensureDataDir();
  fs.writeFileSync(NEW_ARRIVALS_FILE, JSON.stringify(slugs, null, 2), "utf-8");
}

export function getNewArrivalSlugs(): string[] {
  return readNewArrivals();
}

export function addNewArrival(slug: string): boolean {
  if (!slug) return false;
  const slugs = readNewArrivals();
  if (slugs.includes(slug)) return false;
  slugs.push(slug);
  writeNewArrivals(slugs);
  return true;
}

export function removeNewArrival(slug: string): boolean {
  const slugs = readNewArrivals();
  const index = slugs.indexOf(slug);
  if (index === -1) return false;
  slugs.splice(index, 1);
  writeNewArrivals(slugs);
  return true;
}

export function setNewArrival(slug: string, on: boolean): boolean {
  if (on) return addNewArrival(slug);
  return removeNewArrival(slug);
}

export function moveNewArrival(slug: string, dir: -1 | 1): boolean {
  const slugs = readNewArrivals();
  const index = slugs.indexOf(slug);
  if (index === -1) return false;
  const target = index + dir;
  if (target < 0 || target >= slugs.length) return false;
  const [moved] = slugs.splice(index, 1);
  slugs.splice(target, 0, moved);
  writeNewArrivals(slugs);
  return true;
}