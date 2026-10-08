/**
 * Order rules shared by the storefront (client bundle) and the API (server
 * bundle). Kept free of Node-only imports — `fs`/`path` must never reach the
 * browser, so the store that persists orders stays in `order-store.ts`.
 */

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type DeliveryType = "home" | "store";

export const DELIVERY_LABELS: Record<DeliveryType, string> = {
  home: "Home delivery",
  store: "Store pickup",
};

/** Courier fee based on the delivery address: Dhaka, or nationwide. */
export const DELIVERY_CHARGE_DHAKA = 80;
export const DELIVERY_CHARGE_NATIONWIDE = 180;
export const DELIVERY_CHARGE_STORE = 0;

/** Home delivery: 80 taka inside Dhaka, 180 taka nationwide. Store pickup is free. */
export function deliveryChargeFor(deliveryType: DeliveryType, address = ""): number {
  if (deliveryType !== "home") return DELIVERY_CHARGE_STORE;
  return /dhaka|ঢাকা/i.test(address) ? DELIVERY_CHARGE_DHAKA : DELIVERY_CHARGE_NATIONWIDE;
}

export const MAX_LINES_PER_ORDER = 30;
export const MAX_QTY_PER_LINE = 20;