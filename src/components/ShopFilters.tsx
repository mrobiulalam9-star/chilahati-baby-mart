"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AGE_GROUPS, categories } from "@/lib/products";

function useParamSetter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || params.get(key) === value) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };
}

function useClearParams() {
  const router = useRouter();
  return () => {
    router.push("/shop");
    window.scrollTo({ top: 0 });
  };
}

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get("sort") ?? "featured";
  return (
    <select
      value={value}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value === "featured") params.delete("sort");
        else params.set("sort", e.target.value);
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      }}
      className="border border-line bg-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blush"
      aria-label="Sort products"
    >
      <option value="featured">Featured</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name">Name A–Z</option>
    </select>
  );
}

export default function ShopFilters() {
  const setParam = useParamSetter();
  const clearParams = useClearParams();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeAge = searchParams.get("age");
  const hasFilters = Boolean(activeCategory || activeAge);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs uppercase tracking-[0.25em] text-muted mb-4">Category</h3>
        <ul className="space-y-2.5">
          <li>
            <button
              type="button"
              onClick={() => setParam("category")}
              className={`text-sm transition-colors hover:text-blush ${!activeCategory ? "text-blush font-semibold" : ""}`}
            >
              All Products
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => setParam("category", c.slug)}
                className={`text-sm transition-colors hover:text-blush ${
                  activeCategory === c.slug ? "text-blush font-semibold" : ""
                }`}
              >
                {c.name}
                <span className="block text-xs text-muted">{c.nameBn}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.25em] text-muted mb-4">Age</h3>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUPS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setParam("age", g.value)}
              className={`border px-3 py-1.5 text-xs rounded-full transition-colors ${
                activeAge === g.value
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white hover:border-blush"
              }`}
            >
              {g.labelBn}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearParams}
          className="text-xs uppercase tracking-widest underline underline-offset-4 text-muted hover:text-blush transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
