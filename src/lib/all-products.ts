import fs from "fs";
import path from "path";
import { Product, products as staticProducts } from "./products";
import { getHiddenSlugs } from "./admin-hidden";
import { getOverrides } from "./admin-overrides";

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
