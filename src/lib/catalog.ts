import type { Product } from "./products";

/**
 * The trimmed product shape the storefront needs for its order picker. Keeping
 * this separate from the full `Product` keeps the payload sent to the browser
 * small and stops server-only fields leaking into a client bundle.
 */
export type CatalogueEntry = {
  slug: string;
  name: string;
  price: number | null;
  image: string;
  category: string;
  categoryLabel: string;
};

export function toCatalogueEntry(
  product: Product,
  categoryLabel: string
): CatalogueEntry {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images?.[0] || "/products/placeholder.svg",
    category: product.category,
    categoryLabel,
  };
}