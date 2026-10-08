"use client";

import Link from "next/link";
import { categories, type Product } from "@/lib/products";
import { formatPrice, hasPrice, handleImageError } from "@/lib/site";

export default function NewArrivals({ items }: { items: Product[] }) {
  if (items.length === 0) return null;

  const renderCard = (p: Product, suffix: string, duplicate = false) => {
    const main = p.images[0];
    const alt = p.images[1] ?? main;
    const label = categories.find((c) => c.slug === p.category)?.name ?? "";
    return (
      <Link
        key={`${p.slug}-${suffix}`}
        href={`/product/${p.slug}`}
        className="group block w-[240px] shrink-0 sm:w-[320px]"
        tabIndex={duplicate ? -1 : undefined}
        aria-hidden={duplicate ? "true" : undefined}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={main}
            alt={p.name}
            loading="lazy"
            onError={handleImageError}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={alt}
            alt=""
            aria-hidden
            loading="lazy"
            onError={handleImageError}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          <span className="absolute left-3 top-3 rounded-full bg-blush px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
            New
          </span>
        </div>
        <div className="mt-3.5 px-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
          <h3 className="font-display mt-1 text-lg font-semibold leading-snug transition-colors group-hover:text-blush">
            {p.name}
          </h3>
          {hasPrice(p.price) && (
            <p className="mt-1 text-base">
              <span className="font-semibold">{formatPrice(p.price)}</span>
              {p.oldPrice && <s className="ml-2 text-sm text-muted">{formatPrice(p.oldPrice)}</s>}
            </p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <section
      className="border-b border-line bg-paper"
      aria-labelledby="new-arrival-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-9 pb-10">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-blush">
              <span className="h-1.5 w-1.5 rounded-full bg-blush" />
              Just In
            </span>
            <h2 id="new-arrival-heading" className="font-display mt-1.5 text-3xl font-bold sm:text-4xl">
              New Arrival
            </h2>
            <p className="mt-1 text-sm text-muted">Freshly added picks from the shop</p>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 text-sm font-semibold text-blush transition-colors hover:text-blush-deep sm:inline-block"
          >
            Shop all →
          </Link>
        </div>

        <div
          role="region"
          aria-label="New arrival products"
          tabIndex={0}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6"
        >
          {items.map((p) => renderCard(p, "single"))}
        </div>
      </div>
    </section>
  );
}