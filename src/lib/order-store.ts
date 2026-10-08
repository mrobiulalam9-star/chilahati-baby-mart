import fs from "fs";
import path from "path";
import { readJsonFile } from "./data-json";
import {
  ORDER_STATUSES,
  type DeliveryType,
  type OrderStatus,
} from "./order-constants";

export { ORDER_STATUSES, deliveryChargeFor, DELIVERY_CHARGE_DHAKA, DELIVERY_CHARGE_NATIONWIDE, DELIVERY_CHARGE_STORE, MAX_LINES_PER_ORDER, MAX_QTY_PER_LINE } from "./order-constants";
export type { DeliveryType, OrderStatus } from "./order-constants";

/**
 * A single product line on an order. `price` and `lineTotal` are null when the
 * product is listed without a price ("price on request"); such a line is kept
 * on the order but excluded from the money totals, so the shop can confirm the
 * amount by phone instead of silently dropping the item.
 */
export type OrderLine = {
  slug: string;
  name: string;
  price: number | null;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  lineTotal: number | null;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  address: string;
  deliveryType: DeliveryType;
  note?: string;
};

export type Order = {
  id: string;
  orderNo: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderLine[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  hasUnpricedItems: boolean;
};

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readOrders(): Order[] {
  ensureDataDir();
  const data = readJsonFile<unknown>(ORDERS_FILE, []);
  return Array.isArray(data) ? (data as Order[]) : [];
}

function writeOrders(orders: Order[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

/** Newest first, which is the order every screen (admin list, dashboard) wants. */
export function listOrders(): Order[] {
  return readOrders()
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

export function getOrderById(id: string): Order | undefined {
  return readOrders().find((o) => o.id === id);
}

/**
 * Human-quotable reference such as `CBM-26010-004`: the shop prefix, the
 * compact date the order was placed, and that day's sequence. The loop guards
 * against a collision if two orders land in the same millisecond.
 */
function buildOrderNo(orders: Order[], now: Date): string {
  const d = now;
  const day = `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const prefix = `CBM-${day}`;
  let sequence = 0;
  for (const o of orders) {
    if (o.orderNo.startsWith(`${prefix}-`)) {
      const n = Number(o.orderNo.split("-")[2]);
      if (Number.isFinite(n) && n > sequence) sequence = n;
    }
  }
  let candidate = `${prefix}-${pad(sequence + 1)}`;
  let guard = 0;
  while (orders.some((o) => o.orderNo === candidate) && guard < 1000) {
    sequence += 1;
    candidate = `${prefix}-${pad(sequence + 1)}`;
    guard += 1;
  }
  return candidate;
}

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

export type CreateOrderInput = {
  customer: OrderCustomer;
  items: OrderLine[];
  deliveryCharge: number;
  subtotal: number;
  total: number;
  hasUnpricedItems: boolean;
};

export function createOrder(input: CreateOrderInput): Order {
  const orders = readOrders();
  const now = new Date();
  const iso = now.toISOString();
  const order: Order = {
    id: `ord_${now.getTime()}_${Math.random().toString(36).slice(2, 9)}`,
    orderNo: buildOrderNo(orders, now),
    createdAt: iso,
    updatedAt: iso,
    status: "pending",
    customer: input.customer,
    items: input.items,
    subtotal: input.subtotal,
    deliveryCharge: input.deliveryCharge,
    total: input.total,
    hasUnpricedItems: input.hasUnpricedItems,
  };
  orders.push(order);
  writeOrders(orders);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], status, updatedAt: new Date().toISOString() };
  writeOrders(orders);
  return orders[index];
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as string[]).includes(value);
}