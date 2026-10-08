/**
 * Live data sync for production.
 *
 * Render deploys a frozen snapshot of the repo, so the `data/*.json` on the
 * server disk only changes on a redeploy. That is what made every admin edit
 * (new product, price tweak, New Arrival toggle) invisible for ~5 minutes
 * while a build ran.
 *
 * On production we therefore also read those same files straight from the
 * pushed GitHub repository (raw.githubusercontent.com), which updates the
 * moment the auto-deploy watcher commits and pushes a local change. Storefront
 * reads become a merge of "local disk" (the deployed snapshot plus any writes
 * made through this instance's admin panel) and "GitHub" (the freshest pushed
 * copy), so a change made on localhost shows up on the live site within
 * seconds instead of waiting for a rebuild.
 *
 * Disabled in development and during `next build`, so local work and builds
 * never depend on GitHub being reachable.
 */

const OWNER = process.env.LIVE_GIT_OWNER || "mrobiulalam9-star";
const REPO = process.env.LIVE_GIT_REPO || "chilahati-baby-mart";
const BRANCH = process.env.LIVE_GIT_BRANCH || "main";

export const remoteBase = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

const ENABLED =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build";

/** A remote copy is reused for this long before the next background refresh. */
const REVALIDATE_MS = 12_000;
/** If every refresh has failed, keep the last good remote value at most this long. */
const HARD_EXPIRE_MS = 15 * 60 * 1000;

type Entry = { raw: string; at: number };
const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<void>>();

export function isLiveEnabled(): boolean {
  return ENABLED;
}

function parse(raw: string): unknown {
  try {
    return JSON.parse(raw.replace(/^\uFEFF/, "").trim());
  } catch {
    return undefined;
  }
}

async function refresh(file: string): Promise<void> {
  const pending = inflight.get(file);
  if (pending) return pending;
  const task = (async () => {
    try {
      const res = await fetch(`${remoteBase}/${file}`, { cache: "no-store" });
      if (res.ok) cache.set(file, { raw: await res.text(), at: Date.now() });
    } catch {
      // GitHub unreachable: keep whatever we already have (or local data)
    } finally {
      inflight.delete(file);
    }
  })();
  inflight.set(file, task);
  return task;
}

/**
 * Returns the freshest remote JSON for `file`, or `undefined` when it is not
 * available. A slightly stale copy is returned immediately while a fresh one
 * is fetched in the background, so no request is ever blocked on GitHub.
 */
export function liveJson<T>(file: string): T | undefined {
  if (!ENABLED) return undefined;
  const entry = cache.get(file);
  const now = Date.now();
  if (entry && now - entry.at < REVALIDATE_MS) {
    return (parse(entry.raw) ?? undefined) as T | undefined;
  }
  void refresh(file);
  if (entry && now - entry.at < HARD_EXPIRE_MS) {
    return (parse(entry.raw) ?? undefined) as T | undefined;
  }
  return undefined;
}

/**
 * Serves a /products/... path from GitHub as a file URL when the deployed
 * instance does not have the file yet (a photo uploaded locally today is only
 * baked into Render's disk on the next build). Returns null when unavailable.
 */
export function remoteImageUrl(imagePath: string): string | null {
  if (!ENABLED) return null;
  const clean = (imagePath || "").split("?")[0].split("#")[0];
  if (!clean.startsWith("/products/")) return null;
  return `${remoteBase}/public${clean}`;
}