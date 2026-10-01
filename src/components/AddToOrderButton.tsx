"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";

type Props = {
  slug: string;
  name: string;
  price: number | null;
  image?: string;
  quantity?: number;
  size?: string;
  color?: string;
  className?: string;
  label?: string;
};

/**
 * Adds one product (optionally a specific quantity/size/colour) to the shared
 * order basket. The cart drawer opens on add so the customer immediately sees
 * what their order now contains.
 */
export default function AddToOrderButton({
  slug,
  name,
  price,
  image,
  quantity = 1,
  size,
  color,
  className = "border border-line bg-white px-3 py-2 text-xs font-semibold transition-colors hover:border-blush hover:text-blush",
  label = "Add to order",
}: Props) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = items.some((line) => line.slug === slug);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addItem({ slug, name, price, image, size, color }, quantity);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1600);
      }}
      aria-label={`Add ${name} to order`}
      className={`${className} ${justAdded ? "border-mint bg-mint text-white" : inCart ? "text-mint border-mint" : ""}`}
    >
      {justAdded ? "Added to order" : label}
    </button>
  );
}