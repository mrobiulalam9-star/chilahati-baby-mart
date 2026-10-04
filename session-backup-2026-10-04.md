# Session Backup - October 4, 2026

## Summary
Five requests, all shipped to production `https://chilahati-baby-mart.onrender.com/`.

1. **"Place order" instead of "Call the shop"** — the review step's only exit was a `tel:` link, so the delivery form and order submission were unreachable from the drawer.
2. **Admin edits never reached the live site** — the storefront was prerendered at build time, so catalogue changes only appeared after the next deploy.
3. **`npm run build` failed outright** — `tsconfig.json` swept every unrelated project in the repo into the program.
4. **One-command deploys** — added `deploy.ps1` (type-check → stage only app source → commit → push → wait for the live site).
5. **`cloud-cotton-romper` showed "Price on request"** and admin overrides were only half-applied — one canonical merge now used by the storefront and both admin APIs.

Work was done in the live repo `C:\Test` (dev server on port 3003), then pushed to `origin/main` → Render auto-deploy. Six commits, all verified live.

---

## Issue 1: "Call the shop" was a dead end
**Problem:** Clicking a product image opened the drawer, **Add to order** added the item, and the review step offered **Add more products** / **Call the shop**. User wanted a **Place order** button.

**Root cause:** `Call the shop` was an `<a href="tel:...">`. It was the *only* way out of the `review` step — nothing ever called `setStep("details")`, so step 3 (the delivery form) and therefore `POST /api/orders` could not be reached from the drawer at all. Not a cosmetic problem: the checkout was unreachable.

**Resolution — `src/components/OrderDrawer.tsx`**
- Replaced the `tel:` anchor with a primary **Place order** button → `onClick={() => setStep("details")}`, styled like the other primary CTA (`bg-blush`).
- **Add more products** kept as the outlined secondary.
- Dropped the now-unused `site` import (it was only referenced by that link; it would have failed lint).

---

## Issue 2: Admin edits were frozen in production
**Problem:** User wanted changes made at `localhost:3003` to show up on the live site; separately, admin edits appeared not to stick.

**Investigation — the build output was the evidence:**
```
○  /                 (Static)   prerendered as static content
●  /product/[slug]   (SSG)      prerendered as static HTML   ← 79 pages
ƒ  /shop             (Dynamic)
```
`getAllProducts()` reads `data/*.json` through plain **synchronous `fs`** calls. The framework cannot see that as mutable input, so it prerendered the catalogue into static HTML at build time. Admin panel edits only appeared after the next deploy. `/shop` was dynamic purely *incidentally*, because it awaits `searchParams`.

**Resolution** — added `export const dynamic = "force-dynamic"` to:
- `src/app/page.tsx` (home)
- `src/app/product/[slug]/page.tsx` (all product pages; `generateStaticParams` kept — it is simply inert under `force-dynamic`, and the build emits no conflict warning)

**Verification:** real production build + `next start` on port 3100 (dev left untouched on 3003). A product added *after* the build appeared on `/` and `/shop` and got a working `/product/<slug>` page; a name edit propagated to `/`, `/shop` and `/product/<slug>`. Probe data fully reverted — `git status -- data/` clean.

---

## Issue 3: `npm run build` was failing
**Problem:** Hundreds of TypeScript errors; `next build` never got past compilation.

**Root cause:** `tsconfig.json` used `include: ["**/*.ts", "**/*.tsx"]` with only `node_modules` excluded. `C:\Test` also contains `timetrack/`, `dse-dashboard*/`, `chilahati-baby-mart-backup-*/` and other unrelated projects — all pulled into the program and type-checked.

**Resolution:** scoped `include` to `next-env.d.ts`, `src/**/*.ts`, `src/**/*.tsx`, `.next/types/**/*.ts`, `.next/dev/types/**/*.ts`.

**Result:** `tsc --noEmit` went from hundreds of errors to **0**; `npm run build` exits 0.

---

## Issue 4: Deploy workflow (`deploy.ps1`)
**Problem:** Repeating "commit the right files, push, wait for Render" by hand each time.

**Findings:** Render auto-deploys `main` from `github.com/mrobiulalam9-star/chilahati-baby-mart.git`, so publishing is a push. `gh` is not installed and no Render API key exists in `.env`; git push auth is cached and works.

**Resolution — new `deploy.ps1`** (PowerShell, because `bash` is not on PATH; Git Bash exists at `C:\Program Files\Git\bin\bash.exe`). A bash version was written first and discarded. The script:
- refuses to run off `main`
- runs `tsc --noEmit` first — Render's build type-checks, so failures should surface locally
- stages via **`git add -u`** limited to an `$AppPaths` allowlist, so it can only ever update already-tracked files. This matters: the repo root holds ~114 untracked items (other projects, backups, scratch scripts, downloaded responses) that a bare `git add -A` would commit and break the Render build.
- pushes, then **polls the live URL** — a push can succeed and still fail to build

**Bugs found while testing the script itself:**
- `Invoke-Git npx tsc --noEmit` would have executed `git npx tsc` — the type check never actually ran.
- `$AppPaths` was bound positionally and **flattened into one space-joined string**, so `git status` received a nonsense pathspec that matched nothing and the script reported "no changes" on **every** run — silently skipping every deploy. Fixed by always passing a pre-built array.
- `git add` hard-fails on a pathspec that does not exist (`.env.example`) → filter `$AppPaths` through `Test-Path`.
- PowerShell 5.1 promotes git's stderr notes ("Everything up-to-date") to terminating errors under `$ErrorActionPreference = 'Stop'` → relaxed per-call, success judged by `$LASTEXITCODE`.

**Repo hygiene (same commit series):** `scripts/inspect-*.js`, `next-env.d.ts` and `tsconfig.tsbuildinfo` were being committed. `next-env.d.ts` is rewritten by every dev/build run (it flips between `.next/types` and `.next/dev/types`) and now churns the tree permanently — the create-next-app template gitignores it. `.gitignore` also had `.tsbuildinfo`, which never matched `tsconfig.tsbuildinfo`; now `*.tsbuildinfo`. `.gitignore` itself was initially left out of `$AppPaths`, so its own edit never shipped — added.

---

## Issue 5: `cloud-cotton-romper` price + incomplete overrides
**Problem:** `cloud-cotton-romper` rendered "Price on request". Its override held `price: null`, though the product is 450 in `src/lib/products.ts`.

**Second, larger problem found while inspecting:** `applyOverrides` only ever applied `name`, `price`, `oldPrice` and `images`. The admin form *does* save `description`, `featured`, `sizes`, `colors` and `ages` — they were written to `overrides.json` and silently ignored. Worse, it used `??`, and the admin form posts `""` for blank text, `[]` for blank lists and `null` for a blank price, so each of those was accepted as a real value. That is exactly what had erased the product's name (`name: ""`) and nulled its price.

**Also:** **three** copies of this merge existed with different semantics — the storefront, `staticToDashboard` in the dashboard API, and the `PUT` save response. A blanked field would read back as `""`/`null` from the admin API while the storefront showed the original, so the panel and the page could disagree.

**Resolution:**
- **`data/overrides.json`** — `cloud-cotton-romper.price`: `null` → `450`. One line; nothing else touched.
- **`src/lib/all-products.ts`** — replaced `applyOverrides` with an exported **`mergeStaticOverride(base, override)`**, applying `name`, `price`, `description`, `featured`, `sizes`, `colors`, `images` (plus `ages`, `oldPrice`). Two rules: a field the override does not specify keeps the product's value (`setStaticOverride` writes via `JSON.stringify`, which drops `undefined`, so "absent" is reliable on disk); and **empty is not a value** — `""`, `[]` and `null` all fall back to the original. Price overrides only when it is a finite number.
- **`src/app/api/admin/products/route.ts`** and **`src/app/api/admin/products/[id]/route.ts`** — both now call that one function, so the dashboard, the save response and the storefront cannot drift. One data system, unchanged: `overrides.json` for static products, `products.json` for admin-created ones. No auth changes.

**Verification:** `npm run build` exit 0, `tsc` 0 errors, `eslint` 0 errors. `/shop`, `/product/cloud-cotton-romper`, `/admin`, `/admin/dashboard` all 200. Product renders **Cloud Cotton Romper** / **৳450** with no "Price on request". Drove the real admin API end-to-end (login → PUT → storefront → restore): **20/20 checks passed**, covering description/featured/sizes/colors/price/name/images round-tripping, and blank fields each preserving the original value. Confirmed the pre-push data diff was exactly the one price line. Verified live after deploy.

---

## Status
**All requests resolved and deployed.** Live site updated through Render.
- Commits this session: `e27d5e0` (force-dynamic + checkout handoff + tsconfig), `edec5c0` (`deploy.ps1`), `244ac39` + `ef43c68` + `f2ff7c0` (stop tracking generated/scratch files, ignore artifacts), `6c7324d` (price + override merge).
- **Price on request is now reachable only from a product's own `price: null`** in `src/lib/products.ts`, not from an override — a blank override price and a deliberate one are indistinguishable on the wire (`null` either way). Verified no static product currently has a null price, so nothing is price-on-request today. A deliberate opt-in can be added later if wanted.
- **Known, not fixed (deliberately deferred):** Render persistent disk. Admin edits made through the *live* panel are written to the container filesystem and will be lost on redeploy.
- `cloud-cotton-romper`'s override still contains `name: ""` and empty `ages`/`sizes`/`colors`. These are now harmless (the merge ignores blanks) and the product displays correctly, so the data was left as-is rather than rewritten.
- **Stale tooling:** `backup-baby-mart.bat` archives `C:\Test\chilahati-baby-mart\`, a **stale copy last modified Sep 22** — not the live tree. This session's zip was built from `C:\Test` instead.
- **Housekeeping risk:** the backup zips contain `.env` with real admin/JWT credentials and `*.zip` is *not* in `.gitignore`. `deploy.ps1` uses `git add -u` so they cannot be swept in, but a manual `git add -A` would publish them.
- **Build warnings (not addressed):** `next build` reports "Dynamic filesystem access causes tracing of the whole project" from `src/lib/report.ts:51`, `src/app/api/admin/upload` and the product-image paths. Harmless locally, but it bloats deploys.
- Servers in play: `C:\Test` on port 3003 (`next dev`).