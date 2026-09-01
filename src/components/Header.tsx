"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=clothing", label: "Clothing" },
  { href: "/shop?category=shoes", label: "Ladies Clothing" },
  { href: "/shop?category=ladies-bag", label: "Ladies Bag" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [menuOpen]);

  return (
    <>
      <div className="bg-blush-deep text-center text-[12px] text-white/95 py-2 px-4">
        <span className="tracking-wide">
          কল করে অর্ডার করুন · Call to order:{" "}
          <a href={site.phoneHref} className="font-semibold underline underline-offset-2 hover:text-white">
            {site.phoneDisplay}
          </a>{" "}
          — home delivery in Chilahati &amp; nearby areas
        </span>
      </div>
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Menu"
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden p-2 -ml-2 hover:text-blush transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {menuOpen ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M2 5h16M2 10h16M2 15h16" />}
                </svg>
              </button>
              <Link href="/" className="flex items-center gap-2 group">
                <img
                  src="/logo.jpg"
                  alt="Chilahati Ladies & Baby Mart logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-display font-bold text-lg leading-none tracking-tight">
                  Chilahati
                  <br />
                  <span className="text-blush">Ladies &amp; Baby Mart</span>
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-7">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className="text-sm font-medium text-ink/80 hover:text-blush transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href={site.phoneHref}
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-blush hover:bg-blush-deep text-white text-sm font-semibold px-4 py-2 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2z" />
                </svg>
                Order Now
              </a>
            </div>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-line bg-paper">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3.5 text-sm font-medium border-b border-line/60 hover:text-blush transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
