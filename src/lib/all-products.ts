import fs from "fs";
import path from "path";
import { Product, products as staticProducts } from "./products";
import { getHiddenSlugs } from "./admin-hidden";
import { getOverrides } from "./admin-overrides";
import { getNewArrivalSlugs } from "./admin-new-arrivals";
import { readJsonFile } from "./data-json";

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
  const data = readJsonFile<unknown>(productsFile, []);
  return Array.isArray(data) ? (data as AdminProduct[]) : [];
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
  return fs.existsSync(abs) ? clean : fallback;
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

function applyOverrides(p: Product): Product {
  const o = getOverrides()[p.slug];
  if (!o || (!o.name && !o.price && !o.images)) return p;
  const [img1, img2] = resolveImages(o.images ?? p.images, PLACEHOLDER_IMAGE);
  return {
    ...p,
    name: o.name ?? p.name,
    price: o.price === undefined ? p.price : o.price,
    oldPrice: o.oldPrice ?? p.oldPrice,
    images: [img1, img2],
  };
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
