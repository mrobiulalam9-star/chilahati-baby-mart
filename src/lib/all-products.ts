import fs from "fs";
import path from "path";
import { Product, products as staticProducts } from "./products";
import { getHiddenSlugs } from "./admin-hidden";
import { getOverrides, type StaticOverride } from "./admin-overrides";
import { getNewArrivalSlugs } from "./admin-new-arrivals";
import { readJsonFile } from "./data-json";
import { liveJson, remoteImageUrl } from "./live-sync";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number | null;
  oldPrice?: number;
  ages: string[];
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  featured: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

function readAdminProducts(): AdminProduct[] {
  const dataDir = path.join(process.cwd(), "data");
  const productsFile = path.join(dataDir, "products.json");
  const local = readJsonFile<unknown>(productsFile, []);
  const localList = Array.isArray(local) ? (local as AdminProduct[]) : [];

  const remote = liveJson<unknown>("data/products.json");
  if (!remote || !Array.isArray(remote)) return localList;

  const byId = new Map<string, AdminProduct>();
  for (const p of localList) {
    if (p && typeof p === "object" && typeof (p as AdminProduct).id === "string") {
      byId.set((p as AdminProduct).id, p as AdminProduct);
    }
  }
  for (const r of remote) {
    if (r && typeof r === "object" && typeof (r as AdminProduct).id === "string") {
      byId.set((r as AdminProduct).id, r as AdminProduct);
    }
  }
  return Array.from(byId.values());
}

const PLACEHOLDER_IMAGE = "/products/placeholder.svg";
const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Returns `url` if it points at a file that actually exists, otherwise the
 * placeholder. Prevents a missing upload or a renamed asset from rendering a
 * broken image on server-rendered pages, where an onError handler cannot help.
 */
function resolveImage(url: string | undefined | null, fallback: string): string {
  if (!url || typeof url !== "string") return fallback;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  const clean = url.split("?")[0].split("#")[0];
  if (!clean.startsWith("/")) return url;
  const abs = path.join(PUBLIC_DIR, clean.replace(/^\/+/, ""));
  if (fs.existsSync(abs)) return clean;
  return remoteImageUrl(clean) ?? fallback;
}

function resolveImages(images: string[] | undefined, fallback: string): [string, string] {
  const img1 = resolveImage(images?.[0], fallback);
  const img2 = resolveImage(images?.[1], img1);
  return [img1, img2];
}

/**
 * Guarantees a usable slug. Records saved before blank names were allowed can
 * have an empty slug, which would otherwise render as a link to "/product"
 * (a 404). The id keeps the fallback stable and unique.
 */
function productSlug(admin: AdminProduct): string {
  const slug = (admin.slug || "").trim();
  if (slug) return slug;
  const fromName = (admin.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (fromName) return fromName;
  return `product-${admin.id}`;
}

function adminToProduct(admin: AdminProduct): Product {
  const [img1, img2] = resolveImages(admin.images, PLACEHOLDER_IMAGE);
  return {
    slug: productSlug(admin),
    name: admin.name,
    category: admin.category,
    price: admin.price,
    oldPrice: admin.oldPrice,
    ages: admin.ages as Product["ages"],
    sizes: admin.sizes,
    colors: admin.colors,
    images: [img1, img2] as [string, string],
    description: admin.description,
    featured: admin.featured,
  };
}

/**
 * Layers an admin override onto a code-defined product.
 *
 * This is the single place where `data/overrides.json` is interpreted. The
 * storefront (`applyOverrides`) and the admin APIs both call it, so a value can
 * never look one way on the page and another in the dashboard.
 *
 * Two rules drive every field:
 *
 *  1. A field the override does not specify keeps the product's own value.
 *     `setStaticOverride` writes with `JSON.stringify`, which drops `undefined`,
 *     so "absent" is a real, reliable state on disk.
 *  2. Empty is not a value. The admin form posts `""` for a blank text field
 *     and `[]` for blank list fields, and the form posts `null` for a blank
 *     price. Treating those as real values silently erased product names and
 *     turned priced products into "price on request", so blanks fall back to
 *     the product's own value instead.
 *
 * A product whose own `price` is null still renders as "price on request" -
 * that state stays intentional, it just can't be triggered by accident here.
 */
export function mergeStaticOverride(base: Product, override: StaticOverride | undefined): Product {
  if (!override) return base;

  const name = override.name?.trim();
  const description = override.description?.trim();
  const price =
    typeof override.price === "number" && Number.isFinite(override.price)
      ? override.price
      : base.price;

  const [img1, img2] = resolveImages(
    override.images?.length ? override.images : base.images,
    PLACEHOLDER_IMAGE
  );

  return {
    ...base,
    name: name || base.name,
    price,
    oldPrice: override.oldPrice ?? base.oldPrice,
    description: description || base.description,
    featured: typeof override.featured === "boolean" ? override.featured : base.featured,
    ages: override.ages?.length ? (override.ages as Product["ages"]) : base.ages,
    sizes: override.sizes?.length ? override.sizes : base.sizes,
    colors: override.colors?.length ? override.colors : base.colors,
    images: [img1, img2],
  };
}

function applyOverrides(p: Product): Product {
  return mergeStaticOverride(p, getOverrides()[p.slug]);
}

export function getAllProducts(): Product[] {
  const hidden = new Set(getHiddenSlugs());
  const adminProducts = readAdminProducts()
    .filter((p) => !hidden.has(productSlug(p)))
    .map(adminToProduct);
  const existingSlugs = new Set(staticProducts.map((p) => p.slug));
  const uniqueAdmin = adminProducts.filter((p) => !existingSlugs.has(p.slug));
  const visibleStatic = staticProducts.filter((p) => !hidden.has(p.slug)).map(applyOverrides);
  return [...visibleStatic, ...uniqueAdmin];
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  return getAllProducts()
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, count);
}

const NEW_ARRIVAL_SLUGS = [
  "ladies-item-47",
  "ladies-item-46",
  "ladies-item-45",
  "ladies-item-44",
  "ladies-item-43",
  "baby-item-26",
  "baby-item-25",
  "baby-item-24",
  "blossom-party-frock",
  "cloud-cotton-romper",
  "first-steps-booties",
  "pom-pom-beanie",
  "starry-pajama-set",
  "sunny-tee-shorts-set",
];

export function getNewArrivals(count = 20): Product[] {
  const hidden = new Set(getHiddenSlugs());
  const bySlug = new Map<string, Product>();
  for (const p of staticProducts) bySlug.set(p.slug, applyOverrides(p));
  for (const a of readAdminProducts()) bySlug.set(productSlug(a), adminToProduct(a));

  const order = getNewArrivalSlugs();
  const fallback = order.length === 0 ? NEW_ARRIVAL_SLUGS : order;

  const out: Product[] = [];
  const seen = new Set<string>();
  for (const slug of fallback) {
    const product = bySlug.get(slug);
    if (!product || !product.slug || hidden.has(product.slug) || seen.has(product.slug)) continue;
    seen.add(product.slug);
    out.push(product);
    if (out.length >= count) break;
  }
  return out;
}
