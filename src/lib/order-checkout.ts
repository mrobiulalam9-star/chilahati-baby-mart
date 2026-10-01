import { getAllProducts } from "./all-products";
import { getAdminProductBySlug, updateAdminProduct } from "./admin-products";
import {
  DELIVERY_CHARGE_HOME,
  DELIVERY_CHARGE_STORE,
  MAX_LINES_PER_ORDER,
  MAX_QTY_PER_LINE,
  type DeliveryType,
  type OrderCustomer,
  type OrderLine,
} from "./order-store";

export type RawOrderItem = {
  slug?: unknown;
  quantity?: unknown;
  size?: unknown;
  color?: unknown;
};

export type PreparedOrder = {
  customer: OrderCustomer;
  items: OrderLine[];
  deliveryCharge: number;
  subtotal: number;
  total: number;
  hasUnpricedItems: boolean;
};

type Failure = { ok: false; error: string };
type Success = { ok: true; order: PreparedOrder };
export type PreparedResult = Failure | Success;

const BD_MOBILE = /^01[3-9]\d{8}$/;

function text(value: unknown): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim() : "";
}

function fail(error: string): Failure {
  return { ok: false, error };
}

/**
 * Normalises a customer-entered phone number to the 11-digit Bangladeshi mobile
 * form (`01XXXXXXXXX`), tolerating spaces, dashes, brackets and a `+88` prefix,
 * so that order records can be dialled straight from the admin screen.
 */
export function normalisePhone(input: unknown): string | null {
  const digits = text(input).replace(/[\s\-().]/g, "").replace(/^\+?88/, "");
  return BD_MOBILE.test(digits) ? digits : null;
}

function validateCustomer(raw: unknown): { ok: true; value: OrderCustomer } | Failure {
  const body = (raw ?? {}) as Record<string, unknown>;
  const name = text(body.name);
  const address = text(body.address);
  const note = text(body.note).slice(0, 500);
  const deliveryType: DeliveryType = body.deliveryType === "store" ? "store" : "home";
  const phone = normalisePhone(body.phone);

  if (name.length < 2 || name.length > 80) {
    return fail("Please enter your full name (2–80 characters).");
  }
  if (!phone) {
    return fail("Please enter a valid Bangladeshi mobile number (e.g. 01933396237).");
  }
  if (deliveryType === "home" && address.length < 5) {
    return fail("Please enter your delivery address, or choose store pickup.");
  }
  if (address.length > 300) {
    return fail("Please shorten the delivery address to 300 characters or fewer.");
  }

  return {
    ok: true,
    value: {
      name,
      phone,
      address: deliveryType === "store" ? address || "Store pickup" : address,
      deliveryType,
      note: note || undefined,
    },
  };
}

/**
 * Rebuilds the order lines from the catalogue instead of trusting the prices
 * the browser sent. The cart only ever sends a slug, quantity, size and colour;
 * unit price, name and image come from the shop's own data, so a tampered or
 * stale request cannot dictate what the customer is charged.
 */
export function prepareOrder(body: Record<string, unknown>): PreparedResult {
  const customer = validateCustomer(body.customer);
  if (!customer.ok) return customer;

  const rawItems = Array.isArray(body.items) ? (body.items as RawOrderItem[]) : [];
  if (rawItems.length === 0) return fail("Your order is empty. Add at least one product.");
  if (rawItems.length > MAX_LINES_PER_ORDER) {
    return fail(`An order can contain up to ${MAX_LINES_PER_ORDER} different products.`);
  }

  const catalogue = new Map(getAllProducts().map((p) => [p.slug, p]));
  const items: OrderLine[] = [];
  const seen = new Set<string>();
  const stockProblems: string[] = [];

  for (const raw of rawItems) {
    const slug = text(raw.slug);
    if (!slug) return fail("One of the products in your order is missing its identifier.");

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_LINE) {
      return fail(`Quantity for "${slug}" must be between 1 and ${MAX_QTY_PER_LINE}.`);
    }

    const product = catalogue.get(slug);
    if (!product) {
      return fail(`"${slug}" is no longer available. Please remove it and try again.`);
    }

    // Same product in a different size or colour is a separate line.
    const lineKey = `${slug}|${text(raw.size)}|${text(raw.color)}`;
    if (seen.has(lineKey)) {
      const existing = items.find((i) => `${i.slug}|${i.size ?? ""}|${i.color ?? ""}` === lineKey);
      if (existing) {
        const combined = existing.quantity + quantity;
        if (combined > MAX_QTY_PER_LINE) {
          return fail(`You can order up to ${MAX_QTY_PER_LINE} units of "${product.name}".`);
        }
        existing.quantity = combined;
        existing.lineTotal = existing.price === null ? null : existing.price * combined;
      }
      continue;
    }
    seen.add(lineKey);

    const adminProduct = getAdminProductBySlug(slug);
    if (adminProduct && adminProduct.stock > 0 && quantity > adminProduct.stock) {
      stockProblems.push(
        `${product.name} (only ${adminProduct.stock} left, you asked for ${quantity})`
      );
    }

    const price = product.price === null || !Number.isFinite(Number(product.price))
      ? null
      : Number(product.price);

    items.push({
      slug,
      name: product.name,
      price,
      quantity,
      size: text(raw.size) || undefined,
      color: text(raw.color) || undefined,
      image: product.images?.[0],
      lineTotal: price === null ? null : price * quantity,
    });
  }

  if (stockProblems.length > 0) {
    return fail(
      `Not enough stock for ${stockProblems.join(", ")}. Please reduce the quantity.`
    );
  }

  const subtotal = items.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);
  const hasUnpricedItems = items.some((i) => i.price === null);
  const deliveryCharge = customer.value.deliveryType === "home" ? DELIVERY_CHARGE_HOME : DELIVERY_CHARGE_STORE;

  return {
    ok: true,
    order: {
      customer: customer.value,
      items,
      deliveryCharge,
      subtotal,
      total: subtotal + deliveryCharge,
      hasUnpricedItems,
    },
  };
}

/**
 * Reduces stock for catalogue-managed products once an order is safely stored.
 * Failure is swallowed: the order already exists, and a stock write error must
 * not turn a placed order into a failed request.
 */
export function commitStock(items: OrderLine[]): void {
  for (const item of items) {
    const adminProduct = getAdminProductBySlug(item.slug);
    if (!adminProduct || adminProduct.stock <= 0) continue;
    const next = Math.max(0, adminProduct.stock - item.quantity);
    updateAdminProduct(adminProduct.id, { stock: next });
  }
}