import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getNewArrivalSlugs,
  setNewArrival,
  moveNewArrival,
} from "@/lib/admin-new-arrivals";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json({ slugs: getNewArrivalSlugs() });
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { slug, on, move } = body;

    if (move === "up" || move === "down") {
      if (!slug) {
        return NextResponse.json({ error: "slug is required" }, { status: 400 });
      }
      moveNewArrival(slug, move === "up" ? -1 : 1);
      return NextResponse.json({ slugs: getNewArrivalSlugs() });
    }

    if (typeof on !== "boolean" || !slug) {
      return NextResponse.json({ error: "slug and on (boolean) are required" }, { status: 400 });
    }

    setNewArrival(slug, on);
    return NextResponse.json({ slugs: getNewArrivalSlugs() });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}