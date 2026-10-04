"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cartLineKey, useCart, type CartItem } from "@/components/CartContext";
import {
  DELIVERY_CHARGE_HOME,
  DELIVERY_LABELS,
  MAX_QTY_PER_LINE,
  type DeliveryType,
} from "@/lib/order-constants";
import { formatPrice, waLink } from "@/lib/site";

type PlacedOrder = {
  id: string;
  orderNo: string;
  createdAt: string;
  total: number;
  subtotal: number;
  deliveryCharge: number;
  hasUnpricedItems: boolean;
  customer: { name: string; phone: string; address: string; deliveryType: DeliveryType };
  items: { name: string; quantity: number; price: number | null; lineTotal: number | null; size?: string; color?: string }[];
};

type Details = {
  name: string;
  phone: string;
  address: string;
  deliveryType: DeliveryType;
  note: string;
};

const EMPTY_DETAILS: Details = {
  name: "",
  phone: "",
  address: "",
  deliveryType: "home",
  note: "",
};

function lineTotal(item: CartItem): string {
  return item.price === null ? "On request" : formatPrice(item.price * item.quantity);
}

/**
 * The single checkout surface for the shop: opened by the header "Order Now"
 * button, it lists everything the customer has added across the site, takes
 * their delivery details once, and submits all products as a single order.
 */
export default function OrderDrawer() {
  const {
    items,
    catalogue,
    isOpen,
    closeCart,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    totalQty,
    subtotal,
    hasUnpricedItems,
  } = useCart();

  const [step, setStep] = useState<"shop" | "review" | "details" | "done">("review");
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [wasOpen, setWasOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * The panel picks its entry step as it opens: an empty basket drops the
   * customer straight into the picker so they can tick off several products,
   * while a basket that already has items opens on the review list. Updating
   * state during render (rather than in an effect) is the React-sanctioned way
   * to react to a transition like this without a cascading second render.
   */
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setStep(items.length === 0 ? "shop" : "review");
      setSearch("");
      setActiveCategory("");
      setErrors({});
      setFormError("");
      setPlaced(null);
    }
  }

  const pickerCategories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const entry of catalogue) {
      if (entry.category && !seen.has(entry.category)) {
        seen.set(entry.category, entry.categoryLabel || "Products");
      }
    }
    return Array.from(seen, ([slug, label]) => ({ slug, label }));
  }, [catalogue]);

  const filteredCatalogue = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalogue.filter((entry) => {
      if (activeCategory && entry.category !== activeCategory) return false;
      if (!term) return true;
      return (
        entry.name.toLowerCase().includes(term) ||
        entry.categoryLabel.toLowerCase().includes(term)
      );
    });
  }, [catalogue, search, activeCategory]);

  const deliveryCharge = details.deliveryType === "home" ? DELIVERY_CHARGE_HOME : 0;
  const total = subtotal + deliveryCharge;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, closeCart]);

  const whatsappSummary = useMemo(() => {
    if (!placed) return "";
    const lines = placed.items.map(
      (i) => `- ${i.quantity} x ${i.name}${i.size ? ` (${i.size})` : ""}${i.color ? ` / ${i.color}` : ""}: ${i.lineTotal === null ? "price on request" : formatPrice(i.lineTotal)}`
    );
    return (
      `Assalamu Alaikum! I have placed order ${placed.orderNo}.\n\n` +
      `Name: ${placed.customer.name}\n` +
      `Phone: ${placed.customer.phone}\n` +
      `Delivery: ${DELIVERY_LABELS[placed.customer.deliveryType]}\n` +
      `${placed.customer.deliveryType === "home" ? `Address: ${placed.customer.address}\n` : ""}\n` +
      `Items:\n${lines.join("\n")}\n\n` +
      `Total: ${formatPrice(placed.total)}${placed.hasUnpricedItems ? " + items on request" : ""}`
    );
  }, [placed]);

  function validateDetails(): boolean {
    const next: Partial<Record<keyof Details, string>> = {};
    if (details.name.trim().length < 2) next.name = "Please enter your name.";
    const digits = details.phone.replace(/[\s\-().]/g, "").replace(/^\+?88/, "");
    if (!/^01[3-9]\d{8}$/.test(digits)) next.phone = "Enter an 11-digit mobile number, e.g. 01933396237.";
    if (details.deliveryType === "home" && details.address.trim().length < 5) {
      next.address = "Please enter your delivery address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitOrder() {
    if (!validateDetails()) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: details.name.trim(),
            phone: details.phone.trim(),
            address: details.address.trim(),
            deliveryType: details.deliveryType,
            note: details.note.trim() || undefined,
          },
          items: items.map((item) => ({
            slug: item.slug,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "We could not place your order. Please try again.");
        return;
      }
      setPlaced(data.order as PlacedOrder);
      setStep("done");
      clearCart();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Opening the panel always starts a fresh review step, so the reset is tied
   * to the transition itself instead of an effect that would re-render on every
   * cart change.
   */
  function close() {
    closeCart();
  }

  // The picker is its own step; the reset above guarantees it is the step shown
  // whenever the panel opens with an empty basket.
  const picking = step === "shop" || (step === "review" && items.length === 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your order">
      <button
        type="button"
        aria-label="Close order panel"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/40 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold leading-tight">Your Order</h2>
            <p className="text-xs text-muted">
              {step === "done"
                ? "Order placed"
                : picking
                  ? "Tap products to add them"
                  : totalQty > 0
                    ? `${totalQty} item${totalQty === 1 ? "" : "s"} ready to order`
                    : "Add products to start an order"}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-full p-2 text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step !== "done" && (
          <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-[11px] uppercase tracking-[0.2em]">
            <span
              className={
                picking ? "font-semibold text-blush-deep" : items.length > 0 ? "text-mint" : "text-muted"
              }
            >
              1 &middot; Products
            </span>
            <span className="h-px flex-1 bg-line" />
            <span
              className={
                step === "review" && items.length > 0
                  ? "font-semibold text-blush-deep"
                  : step === "details"
                    ? "text-mint"
                    : "text-muted"
              }
            >
              2 &middot; Review
            </span>
            <span className="h-px flex-1 bg-line" />
            <span className={step === "details" ? "font-semibold text-blush-deep" : "text-muted"}>
              3 &middot; Details
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {picking && (
            <div className="space-y-4">
              <div className="relative">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products to add"
                  className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blush"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory("")}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeCategory === "" ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-blush"
                  }`}
                >
                  All
                </button>
                {pickerCategories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => setActiveCategory(category.slug)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeCategory === category.slug
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white hover:border-blush"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {filteredCatalogue.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">
                  No products match &ldquo;{search}&rdquo;.
                </p>
              ) : (
                <ul className="space-y-2">
                  {filteredCatalogue.map((entry) => {
                    const inCart = items.filter((line) => line.slug === entry.slug);
                    const inCartQty = inCart.reduce((sum, line) => sum + line.quantity, 0);
                    return (
                      <li
                        key={entry.slug}
                        className="flex items-center gap-3 rounded-xl border border-line bg-white p-2.5"
                      >
                        <Link
                          href={`/product/${entry.slug}`}
                          onClick={close}
                          className="shrink-0"
                          aria-label={`View ${entry.name}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={entry.image}
                            alt={entry.name}
                            className="h-14 w-12 rounded-lg border border-line bg-paper object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/product/${entry.slug}`}
                            onClick={close}
                            className="line-clamp-2 text-sm font-semibold leading-snug hover:text-blush"
                          >
                            {entry.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted">
                            {entry.price === null ? "Price on request" : formatPrice(entry.price)}
                          </p>
                          {inCartQty > 0 && (
                            <p className="mt-0.5 text-xs font-semibold text-mint">
                              {inCartQty} in order
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {inCartQty > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const last = inCart[inCart.length - 1];
                                if (!last) return;
                                const key = cartLineKey(last);
                                if (last.quantity <= 1) removeItem(key);
                                else setQuantity(key, last.quantity - 1);
                              }}
                              aria-label={`Remove one ${entry.name} from order`}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-cream"
                            >
                              <span className="text-base leading-none">−</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              addItem(
                                {
                                  slug: entry.slug,
                                  name: entry.name,
                                  price: entry.price,
                                  image: entry.image,
                                },
                                1
                              )
                            }
                            aria-label={`Add ${entry.name} to order`}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                              inCartQty > 0
                                ? "border-mint text-mint hover:bg-mint/10"
                                : "border-blush bg-blush text-white hover:bg-blush-deep"
                            }`}
                          >
                            {inCartQty > 0 ? "+" : "Add"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {items.length > 0 && (
                <div className="sticky bottom-0 -mx-5 border-t border-line bg-paper px-5 pb-1 pt-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted">
                      {totalQty} item{totalQty === 1 ? "" : "s"} selected
                    </span>
                    <span className="font-semibold tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("review")}
                    className="w-full rounded-full bg-blush px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blush-deep"
                  >
                    Review order
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "review" && items.length > 0 && (
            <div className="space-y-4">
              <ul className="divide-y divide-line">
                    {items.map((item) => {
                      const key = cartLineKey(item);
                      return (
                        <li key={key} className="flex gap-3 py-3">
                          <Link href={`/product/${item.slug}`} onClick={close} className="shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image || "/products/placeholder.svg"}
                              alt={item.name}
                              className="h-20 w-16 rounded-lg border border-line bg-white object-cover"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={close}
                              className="line-clamp-2 text-sm font-semibold leading-snug hover:text-blush"
                            >
                              {item.name}
                            </Link>
                            {(item.size || item.color) && (
                              <p className="mt-0.5 text-xs text-muted">
                                {[item.size, item.color].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="flex items-center rounded-full border border-line bg-white">
                                <button
                                  type="button"
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  onClick={() => setQuantity(key, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-7 w-7 rounded-full text-ink transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:text-line"
                                >
                                  <span className="text-base leading-none">−</span>
                                </button>
                                <span className="w-6 text-center text-sm font-semibold tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Increase quantity of ${item.name}`}
                                  onClick={() => setQuantity(key, item.quantity + 1)}
                                  disabled={item.quantity >= MAX_QTY_PER_LINE}
                                  className="h-7 w-7 rounded-full text-ink transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:text-line"
                                >
                                  <span className="text-base leading-none">+</span>
                                </button>
                              </div>
                              <span className="text-sm font-semibold tabular-nums">{lineTotal(item)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(key)}
                            aria-label={`Remove ${item.name} from order`}
                            className="h-7 w-7 shrink-0 rounded-full text-muted transition-colors hover:bg-cream hover:text-blush"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                            </svg>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs uppercase tracking-widest text-muted underline underline-offset-4 transition-colors hover:text-blush"
                  >
                    Clear order
                  </button>

                  <dl className="space-y-2 border-t border-line pt-4 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted">Subtotal</dt>
                      <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Delivery (home)</dt>
                      <dd className="font-semibold tabular-nums">{formatPrice(DELIVERY_CHARGE_HOME)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-2 text-base">
                      <dt className="font-semibold">Estimated total</dt>
                      <dd className="font-bold tabular-nums">{formatPrice(total)}</dd>
                    </div>
                  </dl>

                  {hasUnpricedItems && (
                    <p className="rounded-xl bg-cream p-3 text-xs text-ink/80">
                      Items shown as &ldquo;on request&rdquo; are not priced online. Place the order anyway and our
                      team will confirm the amount on the phone.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep("shop")}
                      className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition-colors hover:border-blush hover:text-blush"
                    >
                      Add more products
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="flex-1 rounded-full bg-blush px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blush-deep"
                    >
                      Place order
                    </button>
                  </div>
            </div>
          )}

          {step === "details" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitOrder();
              }}
              noValidate
            >
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted">
                  {totalQty} item{totalQty === 1 ? "" : "s"}
                </span>
                <span className="font-semibold tabular-nums">{formatPrice(subtotal)}</span>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted">
                  Full name
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  value={details.name}
                  onChange={(e) => setDetails({ ...details, name: e.target.value })}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-blush ${errors.name ? "border-red-300" : "border-line"}`}
                  placeholder="e.g. Rahima Khatun"
                />
                {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name}</span>}
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted">
                  Mobile number
                </span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-blush ${errors.phone ? "border-red-300" : "border-line"}`}
                  placeholder="01XXXXXXXXX"
                />
                {errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>}
              </label>

              <fieldset>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                  How would you like it?
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["home", "store"] as DeliveryType[]).map((option) => (
                    <label
                      key={option}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors ${
                        details.deliveryType === option
                          ? "border-blush bg-blush/5 font-semibold text-blush-deep"
                          : "border-line bg-white hover:border-blush/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value={option}
                        checked={details.deliveryType === option}
                        onChange={() => setDetails({ ...details, deliveryType: option })}
                        className="sr-only"
                      />
                      {DELIVERY_LABELS[option]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted">
                  {details.deliveryType === "home" ? "Delivery address" : "Address (optional)"}
                </span>
                <textarea
                  rows={3}
                  value={details.address}
                  onChange={(e) => setDetails({ ...details, address: e.target.value })}
                  className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-blush ${errors.address ? "border-red-300" : "border-line"}`}
                  placeholder="House / road / area, Chilahati Bazar, Dimla"
                />
                {errors.address && <span className="mt-1 block text-xs text-red-600">{errors.address}</span>}
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted">
                  Note for us (optional)
                </span>
                <textarea
                  rows={2}
                  value={details.note}
                  onChange={(e) => setDetails({ ...details, note: e.target.value })}
                  className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-blush"
                  placeholder="Preferred delivery time, gift wrapping, etc."
                />
              </label>

              <dl className="space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">{DELIVERY_LABELS[details.deliveryType]}</dt>
                  <dd className="font-semibold tabular-nums">{formatPrice(deliveryCharge)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base">
                  <dt className="font-semibold">Total to pay</dt>
                  <dd className="font-bold tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>

              {formError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition-colors hover:border-blush hover:text-blush"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full bg-blush px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blush-deep disabled:cursor-wait disabled:opacity-70"
                >
                  {submitting ? "Placing order..." : "Place order"}
                </button>
              </div>

              <p className="text-center text-xs text-muted">
                No advance payment &mdash; cash on delivery. We call to confirm before delivery.
              </p>
            </form>
          )}

          {step === "done" && placed && (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint/15">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f8f76" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold">Order placed</h3>
              <p className="mt-1 text-sm text-muted">Thank you, {placed.customer.name.split(" ")[0]}.</p>

              <div className="mt-5 rounded-2xl border border-line bg-white p-4 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Order number</span>
                  <span className="font-display text-base font-bold tracking-wide">{placed.orderNo}</span>
                </div>
                <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
                  {placed.items.map((item, index) => (
                    <li key={index} className="flex justify-between gap-3">
                      <span className="text-muted">
                        {item.quantity} x {item.name}
                        {item.size ? ` (${item.size})` : ""}
                      </span>
                      <span className="tabular-nums">
                        {item.lineTotal === null ? "On request" : formatPrice(item.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatPrice(placed.total)}</span>
                </div>
                {placed.hasUnpricedItems && (
                  <p className="mt-2 text-xs text-muted">
                    Includes items priced on request — we will confirm the amount by phone.
                  </p>
                )}
              </div>

              <p className="mt-4 text-xs text-muted">
                {DELIVERY_LABELS[placed.customer.deliveryType]}
                {placed.customer.deliveryType === "home" ? `: ${placed.customer.address}` : ""}
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={waLink(whatsappSummary)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-mint/90"
                >
                  Send details on WhatsApp
                </a>
                <Link
                  href="/shop"
                  onClick={close}
                  className="rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold transition-colors hover:border-blush hover:text-blush"
                >
                  Continue shopping
                </Link>
              </div>

              <p className="mt-4 text-xs text-muted">
                Keep order number {placed.orderNo}. We will call {placed.customer.phone} to confirm.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}