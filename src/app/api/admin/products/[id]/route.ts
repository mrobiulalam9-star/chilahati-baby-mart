import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAdminProductById,
  updateAdminProduct,
  deleteAdminProduct,
  deleteImageFiles,
  slugify,
} from "@/lib/admin-products";
import { hideProduct, unhideProduct } from "@/lib/admin-hidden";
import { getOverrides, setStaticOverride } from "@/lib/admin-overrides";
import { products as staticProducts } from "@/lib/products";

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  if (id.startsWith("static_")) {
    return NextResponse.json({ error: "Static products cannot be edited individually" }, { status: 400 });
  }

  const product = getAdminProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = await req.json();

    if (id.startsWith("static_")) {
      const slug = id.replace("static_", "");
      const base = staticProducts.find((p) => p.slug === slug);
      if (!base) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      const updates: Parameters<typeof setStaticOverride>[1] = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.nameBn !== undefined) updates.nameBn = body.nameBn;
      if (body.price !== undefined) updates.price = Number(body.price);
      if (body.oldPrice !== undefined) updates.oldPrice = body.oldPrice ? Number(body.oldPrice) : undefined;
      if (body.images !== undefined) updates.images = body.images;
      if (body.ages !== undefined) updates.ages = body.ages;
      if (body.sizes !== undefined) updates.sizes = body.sizes;
      if (body.colors !== undefined) updates.colors = body.colors;
      if (body.description !== undefined) updates.description = body.description;
      if (body.descriptionBn !== undefined) updates.descriptionBn = body.descriptionBn;
      if (body.featured !== undefined) updates.featured = Boolean(body.featured);

      setStaticOverride(slug, updates);
      const o = getOverrides()[slug];
      return NextResponse.json({
        product: {
          id,
          slug,
          name: o.name ?? base.name,
          nameBn: o.nameBn ?? base.nameBn,
          category: base.category,
          price: o.price ?? base.price,
          oldPrice: o.oldPrice ?? base.oldPrice,
          ages: o.ages ?? base.ages,
          sizes: o.sizes ?? base.sizes,
          colors: o.colors ?? base.colors,
          images: o.images?.length ? o.images : [...base.images],
          description: o.description ?? base.description,
          descriptionBn: o.descriptionBn ?? base.descriptionBn,
          featured: o.featured ?? (base.featured || false),
          stock: 999,
          source: "static",
          updatedAt: o.updatedAt,
        },
      });
    }

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updates.name = body.name;
      updates.slug = slugify(body.name);
    }
    if (body.nameBn !== undefined) updates.nameBn = body.nameBn;
    if (body.category !== undefined) updates.category = body.category;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.oldPrice !== undefined) updates.oldPrice = body.oldPrice ? Number(body.oldPrice) : undefined;
    if (body.ages !== undefined) updates.ages = body.ages;
    if (body.sizes !== undefined) updates.sizes = body.sizes;
    if (body.colors !== undefined) updates.colors = body.colors;
    if (body.images !== undefined) updates.images = body.images;
    if (body.description !== undefined) updates.description = body.description;
    if (body.descriptionBn !== undefined) updates.descriptionBn = body.descriptionBn;
    if (body.featured !== undefined) updates.featured = Boolean(body.featured);
    if (body.stock !== undefined) updates.stock = Number(body.stock);

    const product = updateAdminProduct(id, updates);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  if (id.startsWith("static_")) {
    const slug = id.replace("static_", "");
    const { getHiddenSlugs } = await import("@/lib/admin-hidden");
    const alreadyHidden = getHiddenSlugs().includes(slug);
    if (alreadyHidden) {
      unhideProduct(slug);
      return NextResponse.json({ success: true, action: "unhidden", slug });
    }
    hideProduct(slug);
    return NextResponse.json({ success: true, action: "hidden", slug });
  }

  const deleted = deleteAdminProduct(id);
  if (!deleted) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const filesRemoved = deleteImageFiles(deleted.images);
  return NextResponse.json({ success: true, action: "deleted", filesRemoved });
}
