# Session Backup - October 8, 2026

## Summary
Made the production site `https://chilahati-baby-mart.onrender.com/` match and
stay in sync with local `http://localhost:3003/`. All changes are live on both.

1. **Images + lazy loading (performance)** — compressed 57 product images in
   `public/products/` (22 MB -> 14 MB) with `sharp`, added `loading="lazy"`
   `decoding="async"` to `ProductCard` and homepage category tiles. Deployed
   as `f65667c`.
2. **Store pickup removed** — the "How would you like it?" fieldset in the
   order drawer now offers only home delivery (`src/components/OrderDrawer.tsx`).
3. **Address placeholder** — "House / road / area, Chilahati Bazar, Dimla" is
   now "Your Address" (`src/components/OrderDrawer.tsx`).
4. **Address-based delivery charge** — Dhaka = 80 taka, outside Dhaka = 180 taka
   (was a flat 60). Shared helper `deliveryChargeFor(deliveryType, address)` in
   `src/lib/order-constants.ts`; used by the drawer preview AND server-side
   `src/lib/order-checkout.ts` so the charged amount always matches the preview.
5. **Auto-deploy watcher** — `scripts/auto-deploy.mjs` watches
   `src/ public/ data/ scripts/` + config files; after 15s of quiet it commits
   and pushes to `main`, so Render mirrors every local change automatically.
   Pushed as `3ba4f1e`.
6. **Name placeholder** — name field now shows "Your name"
   (`src/components/OrderDrawer.tsx`).
7. **Bilingual chatbot** — every bot answer returns BOTH Bangla and English.
   Bengali unicode range `[\u0980-\u09FF]` detected so the customer's language
   is answered first (`src/components/Chatbot.tsx`). Intents: address, delivery,
   hours, order, products, price, greeting, fallback.
8. **Form supports Bangla** — inputs/textareas explicitly use the Bangla font
   (`--font-sans` in `src/app/globals.css`) so Bangla renders in the order form.
9. **Bangla "ঢাকা" in charge rule** — `deliveryChargeFor` now matches both
   `dhaka` and `ঢাকা`, so a Bangla-written Dhaka address gets the 80 taka rate
   (`src/lib/order-constants.ts`).

Verified live: the deployed client bundle contains "Your Address" and
`deliveryChargeFor`; `House / road` is gone from production.

---

## How it runs
- Dev server: `npx next dev -p 3003` (was running in background this session).
- Manual deploy: `.\deploy.ps1 -Message "..."` (type-check -> stage -> commit -> push -> wait).
- Auto-deploy watcher: `node scripts/auto-deploy.mjs` (run from `C:\Test` in a
  hidden window; restarts with the machine — NOT sticky across reboots).

## To-Do for next session
- **Keep-alive still pending (user's call).** Render free tier cold-starts after
  ~15 min idle -> "Application loading" screen for the first visitor. Speed work
  is done; only a keep-alive (GitHub Actions ping or UptimeRobot) removes it.
- **Browser cache note:** if production looks old after a deploy, hard-refresh
  (Ctrl+F5); both sites run the identical deployed bundle.

## Useful paths
- Delivery charge rule: `src/lib/order-constants.ts` (`deliveryChargeFor`, matches `dhaka` / `ঢাকা`)
- Chatbot: `src/components/Chatbot.tsx` (bilingual `REPLIES`)
- Order drawer UI: `src/components/OrderDrawer.tsx`
- Server-side order charge: `src/lib/order-checkout.ts`
- Auto-deploy: `scripts/auto-deploy.mjs`
- Globals / fonts: `src/app/globals.css`
- Deploy helper: `deploy.ps1`