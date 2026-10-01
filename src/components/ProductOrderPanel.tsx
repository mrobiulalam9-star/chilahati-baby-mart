"use client";

import { useState } from "react";
import { cartLineKey, useCart } from "@/components/CartContext";
import { MAX_QTY_PER_LINE } from "@/lib/order-constants";
import { formatPrice, hasPrice } from "@/lib/site";

type Props = {
  slug: string;
  name: string;
  price: number | null;
  image?: string;
  sizes: string[];
  colors: string[];
};

/**
 * "Add to order" block on a product page: lets the customer pick size, colour
 * and quantity before adding this product to a combined order, then shows how
 * many units of it the current order already holds.
 */
export default function ProductOrderPanel({ slug, name, price, image, sizes, colors }: Props) {
  const { addItem, items, openCart, setQuantity } = useCart();

  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [color, setColor] = useState<string | undefined>(colors[0]);
  const [quantity, setLocalQuantity] = useState(1);

  const lineKey = cartLineKey({ slug, size, color });
  const inCart = items.find((line) => cartLineKey(line) === lineKey);

  return (
    <div className="mt-8 rounded-2xl border border-line bg-white p-5">
      {sizes.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Select size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  size === s ? "border-blush bg-blush/5 font-semibold text-blush-deep" : "border-line hover:border-blush"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Select colour</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  color === c ? "border-blush bg-blush/5 font-semibold text-blush-deep" : "border-line hover:border-blush"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setLocalQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="h-11 w-11 rounded-full transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:text-line"
          >
            <span className="text-lg leading-none">−</span>
          </button>
          <span className="w-8 text-center font-semibold tabular-nums">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setLocalQuantity((q) => Math.min(MAX_QTY_PER_LINE, q + 1))}
            disabled={quantity >= MAX_QTY_PER_LINE}
            className="h-11 w-11 rounded-full transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:text-line"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => addItem({ slug, name, price, image, size, color }, quantity)}
          className="flex-1 min-w-[12rem] rounded-full bg-blush px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blush-deep"
        >
          {hasPrice(price) ? `Add to order — ${formatPrice((price as number) * quantity)}` : "Add to order"}
        </button>
      </div>

      {inCart && (
        <p className="mt-3 text-xs text-muted">
          {inCart.quantity} already in your order ({hasPrice(inCart.price) ? formatPrice((inCart.price as number) * inCart.quantity) : "price on request"}).{" "}
          <button type="button" onClick={openCart} className="font-semibold text-blush underline underline-offset-4">
            Review order
          </button>
          <button
            type="button"
            onClick={() => setQuantity(lineKey, inCart.quantity + 1)}
            className="ml-2 font-semibold text-blush underline underline-offset-4"
          >
            Add one more
          </button>
        </p>
      )}
    </div>
  );
}