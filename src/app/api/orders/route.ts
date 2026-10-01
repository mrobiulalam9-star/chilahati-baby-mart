import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prepareOrder, commitStock } from "@/lib/order-checkout";
import { createOrder, listOrders } from "@/lib/order-store";
import { sendNewOrderNotification } from "@/lib/admin-mail";

export const dynamic = "force-dynamic";

/**
 * Orders are public and unauthenticated, so the endpoint gets a small in-memory
 * throttle to keep a scripted client from filling `orders.json` or triggering a
 * flood of notification emails. Enough headroom for a customer retrying after a
 * slow connection, tight enough to stop abuse on a single instance.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const hits = new Map<string, { count: number; resetAt: number }>();

function throttle(req: NextRequest): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json({ orders: listOrders() });
}

export async function POST(req: NextRequest) {
  if (!throttle(req)) {
    return NextResponse.json(
      { error: "Too many order requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prepared = prepareOrder(body);
  if (!prepared.ok) {
    return NextResponse.json({ error: prepared.error }, { status: 400 });
  }

  const order = createOrder(prepared.order);
  commitStock(order.items);

  // A failed notification must never fail the order the customer just placed.
  try {
    await sendNewOrderNotification(order);
  } catch {
    /* ignored */
  }

  return NextResponse.json({ order }, { status: 201 });
}