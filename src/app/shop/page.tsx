import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import Chatbot from "@/components/Chatbot";
import { SortSelect } from "@/components/ShopFilters";
import { categories, categoryBySlug, AGE_GROUPS, type AgeGroup } from "@/lib/products";
import { getAllProducts } from "@/lib/all-products";

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

  let list = [...getAllProducts()];
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <Chatbot />
      <div>
        <div className="flex justify-end mb-6">
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>
        {list.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <p className="font-display font-semibold text-2xl">No products match these filters.</p>
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
  );
}
