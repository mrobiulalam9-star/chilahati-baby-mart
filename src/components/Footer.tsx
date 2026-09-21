import Link from "next/link";
import { site } from "@/lib/site";
import { categories } from "@/lib/products";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-3 gap-10">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display font-bold text-xl leading-tight">
            Chilahati
            <br />
            <span className="text-blush">Ladies &amp; Baby Mart</span>
          </p>
          <p className="mt-3 text-sm text-paper/60 leading-relaxed">
            {site.taglineBn}। নবজাতক থেকে ৪ বছর — সব বয়সের জন্য মানসম্পন্ন শিশুতোষ পোশাক ও ফ্যাশন।
          </p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-blush mb-4">Shop</h3>
          <ul className="space-y-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className="text-sm text-paper/70 hover:text-paper transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-blush mb-4">Info</h3>
          <ul className="space-y-2.5">
            <li>
              <Link href="/about" className="text-sm text-paper/70 hover:text-paper transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-paper/70 hover:text-paper transition-colors">
                Contact &amp; Delivery
              </Link>
            </li>
            <li>
              <Link href="/shop" className="text-sm text-paper/70 hover:text-paper transition-colors">
                All Products
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-paper/50">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>{site.nameBn} · {site.addressShort}</p>
        </div>
      </div>
    </footer>
  );
}