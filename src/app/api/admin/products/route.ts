import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAllAdminProducts,
  createAdminProduct,
  slugify,
  type AdminProduct,
} from "@/lib/admin-products";
import { products as staticProducts } from "@/lib/products";
import { getHiddenSlugs, hideProduct, unhideProduct } from "@/lib/admin-hidden";
import { getOverrides } from "@/lib/admin-overrides";
import { getNewArrivalSlugs } from "@/lib/admin-new-arrivals";

export type DashboardProduct = {
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
  source: "static" | "admin";
  hidden?: boolean;
  newArrival?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function staticToDashboard(p: (typeof staticProducts)[0], hidden: boolean, newArrivals: Set<string>): DashboardProduct {
  const o = getOverrides()[p.slug];
  return {
    id: `static_${p.slug}`,
    slug: p.slug,
    name: o?.name ?? p.name,
    category: p.category,
    price: o?.price === undefined ? p.price : o.price,
    oldPrice: o?.oldPrice ?? p.oldPrice,
    ages: o?.ages ?? p.ages,
    sizes: o?.sizes ?? p.sizes,
    colors: o?.colors ?? p.colors,
    images: o?.images?.length ? [...o.images] : [...p.images],
    description: o?.description ?? p.description,
    featured: o?.featured ?? (p.featured || false),
    stock: 999,
    source: "static",
    hidden,
    newArrival: newArrivals.has(p.slug),
  };
}

function adminToDashboard(p: AdminProduct, newArrivals: Set<string>): DashboardProduct {
  const slug = p.slug?.trim() || `product-${p.id}`;
  return {
    ...p,
    slug,
    source: "admin",
    newArrival: newArrivals.has(slug),
  };
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const hidden = new Set(getHiddenSlugs());
  const newArrivals = new Set(getNewArrivalSlugs());
  const adminProducts = getAllAdminProducts()
    .filter((p) => !hidden.has(p.slug))
    .map((p) => adminToDashboard(p, newArrivals));
  const adminSlugs = new Set(adminProducts.map((p) => p.slug));
  const allStatic = staticProducts
    .filter((p) => !adminSlugs.has(p.slug) && !hidden.has(p.slug))
    .map((p) => staticToDashboard(p, false, newArrivals));

  const all = [...allStatic, ...adminProducts];
  return NextResponse.json({ products: all });
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const {
      name,
      category,
      price,
      oldPrice,
      ages,
      sizes,
      colors,
      images,
      description,
      featured,
      stock,
    } = body;

    if (!name || !category || !price) {
      return NextResponse.json(
        { error: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    const slug = slugify(name);
    const product = createAdminProduct({
      slug,
      name,
      category,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      ages: ages || [],
      sizes: sizes || [],
      colors: colors || [],
      images: images || [],
      description: description || "",
      featured: Boolean(featured),
      stock: Number(stock) || 0,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
