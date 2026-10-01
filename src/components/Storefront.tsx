import { getAllProducts } from "@/lib/all-products";
import { categories } from "@/lib/products";
import { toCatalogueEntry } from "@/lib/catalog";
import SiteShell from "@/components/SiteShell";

/**
 * Server-side entry point for the storefront. The catalogue is read on the
 * server and handed to the client shell so the order picker can list products
 * without a public JSON endpoint or a client-side fetch.
 */
export default function Storefront({ children }: { children: React.ReactNode }) {
  const catalogue = getAllProducts().map((product) =>
    toCatalogueEntry(
      product,
      categories.find((c) => c.slug === product.category)?.name ?? ""
    )
  );

  return <SiteShell catalogue={catalogue}>{children}</SiteShell>;
}