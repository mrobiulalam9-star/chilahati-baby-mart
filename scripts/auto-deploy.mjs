/**
 * Watches the app's source on disk and, once changes settle, commits and
 * pushes them to `main` so Render auto-deploys the site. Use with the dev
 * server (`next dev -p 3003`) to mirror every local change to production.
 *
 * Start it:
 *   node scripts/auto-deploy.mjs
 *
 * Notes:
 *  - Brand-new files under src/public/data/scripts are staged too (deploy.ps1
 *    alone only stages tracked files, so pre-staging lets new files ship).
 *  - There is a 15s calm-down window, so it fires once per edit burst, not on
 *    every keystroke.
 *  - The deploy itself runs deploy.ps1, which type-checks and pushes; Render
 *    rebuilds from `main` on every push.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn, execSync } from "node:child_process";

const ROOT = process.cwd();
const WATCH_DIRS = ["src", "public", "data", "scripts"];
const APP_FILES = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "postcss.config.mjs",
  "tsconfig.json",
  ".gitignore",
];

const DEBOUNCE_MS = 15000;
const IGNORE_PREFIXES = [".git", ".next", "node_modules"];

let timer = null;
let busy = false;
let queued = false;

function schedule() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(deploy, DEBOUNCE_MS);
}

function isIgnored(dir) {
  return IGNORE_PREFIXES.some((p) => dir.includes(path.sep + p + path.sep) || dir.startsWith(p + path.sep));
}

async function deploy() {
  if (busy) {
    queued = true;
    return;
  }
  busy = true;
  timer = null;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  try {
    const targets = [...WATCH_DIRS.filter((d) => fs.existsSync(path.join(ROOT, d)))];
    for (const f of APP_FILES) if (fs.existsSync(path.join(ROOT, f))) targets.push(f);
    execSync(`git add -- ${targets.join(" ")}`, { cwd: ROOT, stdio: "pipe" });
  } catch (e) {
    console.log(`[auto-deploy] git add failed: ${e.message}`);
  }

  console.log(`\n[auto-deploy] ${new Date().toLocaleTimeString()}  changes detected, deploying...`);
  const ps = path.join(ROOT, "deploy.ps1");
  const child = spawn(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps, "-Message", `auto-deploy ${stamp}`],
    { cwd: ROOT, stdio: "inherit", detached: false }
  );
  child.on("exit", (code) => {
    busy = false;
    console.log(`[auto-deploy] finished (exit ${code})`);
    if (queued) {
      queued = false;
      schedule();
    }
  });
}

for (const dir of WATCH_DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  fs.watch(abs, { recursive: true }, (event, filename) => {
    if (filename && isIgnored(String(filename))) return;
    schedule();
  });
  console.log(`[auto-deploy] watching ${dir}/`);
}

for (const file of APP_FILES) {
  const abs = path.join(ROOT, file);
  if (fs.existsSync(abs)) {
    fs.watch(abs, () => schedule());
    console.log(`[auto-deploy] watching ${file}`);
  }
}

console.log("[auto-deploy] Every local change will now be committed and pushed to main, so Render syncs the live site.");