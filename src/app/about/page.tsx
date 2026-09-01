import Link from "next/link";
import { site } from "@/lib/site";

const VALUES = [
  {
    title: "Quality First",
    titleBn: "মানের কথা",
    desc: "Every piece is hand-checked for fabric, stitching and safety before it reaches the shelf.",
  },
  {
    title: "Fair Prices",
    titleBn: "সাশ্রয়ী দাম",
    desc: "Direct sourcing keeps prices honest — quality babywear should not be a luxury.",
  },
  {
    title: "Parent Trusted",
    titleBn: "অভিভাবকদের ভরসা",
    desc: "Families across Chilahati and Dimla come back to us for every new arrival.",
  },
];

export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="max-w-2xl">
        <p className="text-blush-deep font-semibold tracking-wide">আমাদের গল্প</p>
        <h1 className="font-display font-bold text-4xl leading-tight mt-2">
          Born in Chilahati, dressing little stars.
        </h1>
      </header>

      <div className="grid md:grid-cols-2 gap-12 mt-10 items-start">
        <div className="space-y-5 text-muted leading-relaxed">
          <p>
            {site.name} started with one simple belief — parents in our corner of Nilphamari
            deserve the same quality baby clothing you would find in Dhaka, without the trip or
            the markup. What began as a small counter at Chilahati Bazar is today a favourite
            stop for families from Dimla and beyond.
          </p>
          <p>
            চিলাহাটি বাজারের একটি ছোট্ট দোকান থেকে আমাদের যাত্রা শুরু। আজ দিল্লার-নয়,
            দিমলা-জুড়ে শত শত পরিবার তাদের সোনামণির পোশাক খোঁজে আমাদের কাছেই।
          </p>
          <p>
            We personally select every romper, frock, bootie and bib — feeling the fabric,
            testing the snaps and imagining how it will survive real baby life. If we would not
            dress our own children in it, we do not sell it.
          </p>
          <p className="text-ink font-medium">
            {site.tagline}. {site.taglineBn}।
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-sky/15 via-cream to-blush/15 border border-line p-8">
          <dl className="grid grid-cols-3 gap-6 text-center">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Products</dt>
              <dd className="font-display font-bold text-3xl text-blush mt-1">200+</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Ages</dt>
              <dd className="font-display font-bold text-3xl text-blush mt-1">0–4y</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Happy families</dt>
              <dd className="font-display font-bold text-3xl text-blush mt-1">1k+</dd>
            </div>
          </dl>
          <hr className="border-line my-7" />
          <h2 className="font-display font-semibold text-lg">Visit the shop</h2>
          <address className="not-italic mt-3 text-sm text-muted leading-relaxed">
            {site.addressLines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
            {site.hours.map((h) => (
              <span key={h.days} className="block mt-2">
                {h.days}: {h.time}
              </span>
            ))}
          </address>
          <Link
            href="/contact"
            className="mt-5 inline-block rounded-full bg-blush hover:bg-blush-deep text-white text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            Contact &amp; directions →
          </Link>
        </div>
      </div>

      <section className="mt-16 grid sm:grid-cols-3 gap-6">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-3xl border border-line bg-white p-6">
            <h3 className="font-display font-bold text-lg">
              {v.title} <span className="text-muted text-sm font-normal">· {v.titleBn}</span>
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
