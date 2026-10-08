"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { categories, type Product } from "@/lib/products";
import { formatPrice, hasPrice, handleImageError } from "@/lib/site";

export default function NewArrivals({ items }: { items: Product[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const first = el.querySelector("a");
    const step = (first ? first.getBoundingClientRect().width : 260) + 20;

    let raf = 0;
    const tick = () => {
      if (!pausedRef.current && !document.hidden && el.scrollWidth > el.clientWidth + 4) {
        if (el.scrollLeft >= step - 1) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += 1.2;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (items.length === 0) return null;

  const scrollTo = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.querySelector("a");
    const step = (first ? first.getBoundingClientRect().width : 260) + 20;
    if (dir === 1 && el.scrollLeft >= step - 1) {
      el.scrollLeft = 0;
    } else {
      el.scrollLeft = Math.max(0, el.scrollLeft + dir * step);
    }
  };

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

        <div className="relative">
          <button
            type="button"
            aria-label="Scroll new arrivals left"
            onClick={() => scrollTo(-1)}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-blush shadow-md transition hover:bg-white hover:text-blush-deep"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12.7 15.7a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 1 1 1.4 1.4L8.4 10l4.3 4.3a1 1 0 0 1 0 1.4Z" clipRule="evenodd" />
            </svg>
          </button>
          <div
            ref={trackRef}
            role="region"
            aria-label="New arrival products"
            tabIndex={0}
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
            className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
          >
            {items.map((p) => renderCard(p, "single"))}
            {items.length > 1 && renderCard(items[0], "clone", true)}
          </div>
          <button
            type="button"
            aria-label="Scroll new arrivals right"
            onClick={() => scrollTo(1)}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-blush shadow-md transition hover:bg-white hover:text-blush-deep"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}