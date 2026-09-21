import fs from "fs";
import path from "path";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  category: string;
  price: number;
  oldPrice?: number;
  ages: string[];
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  descriptionBn: string;
  featured: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readProducts(): AdminProduct[] {
  ensureDataDir();
  if (!fs.existsSync(PRODUCTS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeProducts(products: AdminProduct[]) {
  ensureDataDir();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
}

export function getAllAdminProducts(): AdminProduct[] {
  return readProducts();
}

export function getAdminProductById(id: string): AdminProduct | undefined {
  return readProducts().find((p) => p.id === id);
}

export function getAdminProductBySlug(slug: string): AdminProduct | undefined {
  return readProducts().find((p) => p.slug === slug);
}

export function createAdminProduct(
  product: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">
): AdminProduct {
  const products = readProducts();
  const now = new Date().toISOString();
  const newProduct: AdminProduct = {
    ...product,
    id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  products.push(newProduct);
  writeProducts(products);
  return newProduct;
}

export function updateAdminProduct(
  id: string,
  updates: Partial<Omit<AdminProduct, "id" | "createdAt">>
): AdminProduct | null {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeProducts(products);
  return products[index];
}

export function deleteAdminProduct(id: string): AdminProduct | null {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const [removed] = products.splice(index, 1);
  writeProducts(products);
  return removed;
}

export function deleteImageFiles(imageUrls: string[]): string[] {
  const removed: string[] = [];
  for (const url of imageUrls || []) {
    if (!url) continue;
    let abs: string | null = null;
    if (url.startsWith("/")) {
      abs = path.join(process.cwd(), "public", url.replace(/^\/+/, ""));
    } else if (/^[a-zA-Z]:[\\/]/.test(url)) {
      abs = url;
    }
    if (!abs) continue;
    try {
      if (fs.statSync(abs).isFile()) {
        fs.unlinkSync(abs);
        removed.push(url);
      }
    } catch {
      // file already gone – nothing to remove
    }
  }
  return removed;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
