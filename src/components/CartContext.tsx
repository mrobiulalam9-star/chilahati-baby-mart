"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { MAX_QTY_PER_LINE } from "@/lib/order-constants";
import type { CatalogueEntry } from "@/lib/catalog";

export type CartItem = {
  slug: string;
  name: string;
  price: number | null;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
};

/** The identity of a cart line: same product, same size, same colour. */
export function cartLineKey(item: Pick<CartItem, "slug" | "size" | "color">): string {
  return `${item.slug}|${item.size ?? ""}|${item.color ?? ""}`;
}

type CartContextValue = {
  items: CartItem[];
  catalogue: CatalogueEntry[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalQty: number;
  subtotal: number;
  hasUnpricedItems: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cbm.order-cart.v1";
const EMPTY_CART: CartItem[] = [];

function clampQuantity(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_QTY_PER_LINE, Math.max(1, n));
}

/**
 * Accepts only the shape the cart itself writes, so a hand-edited or stale
 * localStorage entry can never put a malformed line into an order.
 */
function parseStoredCart(raw: string): CartItem[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  const out: CartItem[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.slug !== "string" || !e.slug) continue;
    if (typeof e.name !== "string" || !e.name) continue;
    out.push({
      slug: e.slug,
      name: e.name,
      price: typeof e.price === "number" && Number.isFinite(e.price) ? e.price : null,
      quantity: clampQuantity(e.quantity),
      size: typeof e.size === "string" && e.size ? e.size : undefined,
      color: typeof e.color === "string" && e.color ? e.color : undefined,
      image: typeof e.image === "string" && e.image ? e.image : undefined,
    });
  }
  return out;
}

/**
 * The basket lives in an external store rather than component state, because
 * it has to survive full page navigations and be shared by the whole storefront.
 * Reading it through `useSyncExternalStore` also means the server-rendered HTML
 * (which has no access to `localStorage`) and the first client render agree, so
 * a returning customer's basket never triggers a hydration mismatch.
 */
let snapshot: CartItem[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): CartItem[] {
  if (snapshot) return snapshot;
  let initial: CartItem[] = [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) initial = parseStoredCart(raw);
  } catch {
    // Corrupted or blocked storage simply starts an empty basket.
  }
  snapshot = initial;
  return snapshot;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Keep tabs in step, so two open tabs do not fight over the same basket.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    snapshot = null;
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(items: CartItem[]): void {
  snapshot = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode or a full quota must not break ordering.
  }
  emit();
}

/**
 * Order basket shared by the whole storefront: customers add a single product or
 * several of them while browsing, then the header "Order Now" button opens the
 * checkout drawer to submit them all as one order.
 */
export function CartProvider({
  children,
  catalogue,
}: {
  children: React.ReactNode;
  catalogue: CatalogueEntry[];
}) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    const qty = clampQuantity(quantity);
    const key = cartLineKey(item);
    const current = getSnapshot();
    const existing = current.find((line) => cartLineKey(line) === key);
    if (existing) {
      write(
        current.map((line) =>
          cartLineKey(line) === key
            ? { ...line, quantity: Math.min(MAX_QTY_PER_LINE, line.quantity + qty) }
            : line
        )
      );
    } else {
      write([...current, { ...item, quantity: qty }]);
    }
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    write(getSnapshot().filter((line) => cartLineKey(line) !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    const q = clampQuantity(quantity);
    write(getSnapshot().map((line) => (cartLineKey(line) === key ? { ...line, quantity: q } : line)));
  }, []);

  const clearCart = useCallback(() => write([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalQty = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + (line.price === null ? 0 : line.price * line.quantity), 0),
    [items]
  );
  const hasUnpricedItems = useMemo(() => items.some((line) => line.price === null), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      catalogue,
      isOpen,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      openCart,
      closeCart,
      totalQty,
      subtotal,
      hasUnpricedItems,
    }),
    [
      items,
      catalogue,
      isOpen,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      openCart,
      closeCart,
      totalQty,
      subtotal,
      hasUnpricedItems,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}