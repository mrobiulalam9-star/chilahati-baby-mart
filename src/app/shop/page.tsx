import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ShopFilters, { SortSelect } from "@/components/ShopFilters";
import { products, categories, categoryBySlug, AGE_GROUPS, type AgeGroup } from "@/lib/products";

export const metadata = { title: "Shop" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const categorySlug = first(sp.category);
  const age = first(sp.age);
  const sort = first(sp.sort) ?? "featured";

  const activeCategory = categoryBySlug(categorySlug);

  let list = [...products];
  if (activeCategory) list = list.filter((p) => p.category === activeCategory.slug);
  if (age && AGE_GROUPS.some((g) => g.value === age)) {
    const ageGroup = age as AgeGroup;
    list = list.filter((p) => p.ages.includes(ageGroup));
  }
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  else {
    list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }

  const filters = (
    <ShopFilters />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display font-bold text-4xl">
          {activeCategory ? activeCategory.name : "Shop All"}
        </h1>
        <p className="text-muted mt-2">
          {activeCategory ? (
            <>
              {activeCategory.nameBn} ·{" "}
            </>
          ) : (
            <>সব পণ্য · </>
          )}
          <span>{list.length} items</span>
        </p>
      </header>

      <details className="lg:hidden mb-8 border border-line bg-white rounded-2xl px-5 py-4" open={false}>
        <summary className="cursor-pointer text-xs uppercase tracking-[0.25em] select-none">Filters</summary>
        <div className="pt-6">
          <Suspense fallback={<p className="text-sm text-muted">Loading filters…</p>}>{filters}</Suspense>
        </div>
      </details>

      <div className="grid lg:grid-cols-[220px_1fr] gap-12 items-start">
        <aside className="hidden lg:block sticky top-28">
          <Suspense fallback={<p className="text-sm text-muted">Loading filters…</p>}>{filters}</Suspense>
        </aside>

        <div>
          <div className="flex justify-end mb-6">
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
          </div>
          {list.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <p className="font-display font-semibold text-2xl">এই ফিল্টারে কোনো পণ্য নেই।</p>
              <p className="text-muted text-sm">Try broadening your selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
              {list.map((p) => (
                <ProductCard
                  key={p.slug}
                  slug={p.slug}
                  name={p.name}
                  price={p.price}
                  oldPrice={p.oldPrice}
                  images={p.images}
                  categoryLabel={categories.find((c) => c.slug === p.category)?.name ?? ""}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
