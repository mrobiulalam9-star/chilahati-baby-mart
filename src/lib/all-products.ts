import fs from "fs";
import path from "path";
import { Product, products as staticProducts } from "./products";
import { getHiddenSlugs } from "./admin-hidden";
import { getOverrides } from "./admin-overrides";
import { getNewArrivalSlugs } from "./admin-new-arrivals";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
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
  if (!fs.existsSync(productsFile)) return [];
  try {
    const data = fs.readFileSync(productsFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function adminToProduct(admin: AdminProduct): Product {
  const img1 = admin.images[0] || "/products/placeholder.jpg";
  const img2 = admin.images[1] || img1;
  return {
    slug: admin.slug,
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
  const img1 = o.images?.[0] || p.images[0];
  const img2 = o.images?.[1] || img1;
  return {
    ...p,
    name: o.name ?? p.name,
    price: o.price ?? p.price,
    oldPrice: o.oldPrice ?? p.oldPrice,
    images: [img1, img2],
  };
}

export function getAllProducts(): Product[] {
  const hidden = new Set(getHiddenSlugs());
  const adminProducts = readAdminProducts()
    .filter((p) => !hidden.has(p.slug))
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
  for (const a of readAdminProducts()) bySlug.set(a.slug, adminToProduct(a));

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
