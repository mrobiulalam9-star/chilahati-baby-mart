import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import OrderButtons from "@/components/OrderButtons";
import { products, categories } from "@/lib/products";
import { site } from "@/lib/site";

const TRUST = [
  {
    title: "Authentic Quality",
    titleBn: "মানসম্মত পণ্য",
    desc: "Skin-friendly fabrics, checked piece by piece.",
    icon: (
      <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3zM9 12l2 2 4-4" />
    ),
  },
  {
    title: "Cash on Delivery",
    titleBn: "ক্যাশ অন ডেলিভারি",
    desc: "Pay when the parcel reaches your door.",
    icon: (
      <path d="M3 8h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8zm0 0 2-3h14l2 3M12 11v3m-2.5-1.5h5" />
    ),
  },
  {
    title: "Home Delivery",
    titleBn: "হোম ডেলিভারি",
    desc: "Chilahati bazar area and nearby unions.",
    icon: <path d="M3 11l9-7 9 7M5.5 9.5V20h13V9.5M10 20v-6h4v6" />,
  },
  {
    title: "Easy Exchange",
    titleBn: "সহজ এক্সচেঞ্জ",
    desc: "Size issue? Exchange within 3 days.",
    icon: <path d="M4 9h13l-3-3m6 9H7l3 3" />,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "আমার মেয়ের ঈদের ফ্রক এখান থেকেই নিয়েছি। কাপড়ের কোয়ালিটি দেখে সত্যিই মুগ্ধ!",
    name: "Rumana Akter",
    place: "Chilahati",
  },
  {
    quote:
      "Best baby clothing collection in Dimla. The owner helped me pick the perfect gift set for my nephew.",
    name: "Mahfuz Rahman",
    place: "Dimla Sadar",
  },
  {
    quote:
      "ফোনে অর্ডার দিলাম, সেইম দিনেই ডেলিভারি পেয়ে গেছি। দামও অনেক ঠিকঠাক।",
    name: "Shahida Parvin",
    place: "Khalisha Chapani",
  },
];

export default function HomePage() {
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const heroImages = [
    products[1].images[0],
    products[0].images[0],
    products[6].images[0],
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blush/15 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-sky/15 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-blush-deep font-semibold tracking-wide">{site.nameBn}</p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight mt-3">
              Little smiles start here.
              <span className="block text-2xl sm:text-3xl mt-3 text-muted font-medium leading-snug">
                {site.taglineBn}
              </span>
            </h1>
            <p className="mt-6 text-muted leading-relaxed max-w-md">
              Newborn to 4 years — adorable, comfortable and safe baby clothing, shoes,
              caps and accessories at {site.addressShort}.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center rounded-full bg-blush hover:bg-blush-deep text-white font-semibold px-7 py-3.5 transition-colors"
              >
                Browse Collection
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border-2 border-line hover:border-blush px-7 py-3.5 font-semibold transition-colors"
              >
                Visit Our Shop
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span>✓ Cash on delivery</span>
              <span>✓ Home delivery nearby</span>
              <span>✓ 3-day exchange</span>
            </div>
          </div>
          <div className="relative h-[380px] sm:h-[440px] hidden sm:block">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              src={heroImages[0]}
              alt=""
              aria-hidden
              className="absolute right-0 top-0 w-56 lg:w-64 aspect-[3/4] object-cover rounded-3xl shadow-xl rotate-3 border-4 border-white"
            />
            <img
              src={heroImages[1]}
              alt=""
              aria-hidden
              className="absolute left-6 top-16 w-52 lg:w-60 aspect-[3/4] object-cover rounded-3xl shadow-xl -rotate-6 border-4 border-white"
            />
            <img
              src={heroImages[2]}
              alt=""
              aria-hidden
              className="absolute right-24 bottom-0 w-48 lg:w-56 aspect-square object-cover rounded-full shadow-xl border-4 border-white"
            />
            {/* eslint-enable @next/next/no-img-element */}
            <div className="absolute left-0 bottom-6 bg-white rounded-2xl shadow-lg px-5 py-4 rotate-[-2deg]">
              <p className="text-xs uppercase tracking-widest text-muted">Newborn to</p>
              <p className="font-display font-bold text-2xl text-blush">4 years</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <span className="shrink-0 text-blush">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {t.icon}
                </svg>
              </span>
              <div>
                <p className="font-semibold text-sm">
                  {t.title} <span className="text-muted font-normal">· {t.titleBn}</span>
                </p>
                <p className="text-xs text-muted mt-1 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-3xl">Shop by Category</h2>
            <p className="text-muted mt-1">আপনার প্রয়োজন অনুযায়ী ক্যাটাগরি বেছে নিন</p>
          </div>
          <Link href="/shop" className="hidden sm:inline-block text-sm font-semibold text-blush hover:text-blush-deep transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c, i) => {
            const sample = products.find((p) => p.category === c.slug);
            return (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-line bg-white"
              >
                <div className={`aspect-[4/3] overflow-hidden ${i % 2 ? "bg-cream" : "bg-paper"}`}>
                  {sample && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={sample.images[0]}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold group-hover:text-blush transition-colors">{c.name}</h3>
                  <p className="text-sm text-muted">{c.nameBn}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-cream/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl">Featured Products</h2>
              <p className="text-muted mt-1">এই সপ্তাহের বিশেষ পণ্য</p>
            </div>
            <Link href="/shop" className="hidden sm:inline-block text-sm font-semibold text-blush hover:text-blush-deep transition-colors">
              Shop all →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {featured.map((p) => (
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
        </div>
      </section>

      {/* Visit us */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-blush-deep font-semibold tracking-wide">Visit Us · আমাদের দোকানে আসুন</p>
          <h2 className="font-display font-bold text-3xl leading-tight mt-2">
            A family-run shop parents in Dimla trust.
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Right at Chilahati Bazar, we hand-pick every romper, bootie and bib — checking fabric,
            stitching and safety before it reaches our shelves. Come touch the fabrics yourself,
            or order over the phone and we will deliver to your door.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            {site.hours.map((h) => (
              <div key={h.days} className="flex justify-between max-w-sm border-b border-line pb-2">
                <dt className="text-muted">{h.days}</dt>
                <dd className="font-semibold">{h.time}</dd>
              </div>
            ))}
          </dl>
          <Link href="/about" className="mt-6 inline-block text-sm font-semibold text-blush hover:text-blush-deep transition-colors">
            More about us →
          </Link>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-blush/20 via-cream to-sky/20 border border-line p-8 md:p-10">
          <h3 className="font-display font-bold text-2xl">Ordering is easy</h3>
          <ol className="mt-5 space-y-4 text-sm">
            {[
              ["Pick a product", "ব্রাউজ করে পছন্দের পণ্য বেছে নিন"],
              ["Call or WhatsApp us", "কল বা WhatsApp এ অর্ডার কনফার্ম করুন"],
              ["Get it at your door", "ঢাকা-বাইরে কুরিয়ার, চিলাহাটিতে হোম ডেলিভারি"],
            ].map(([en, bn], i) => (
              <li key={en} className="flex gap-4 items-start">
                <span className="shrink-0 w-8 h-8 rounded-full bg-blush text-white font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span>
                  <strong>{en}</strong>
                  <span className="block text-muted">{bn}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-7">
            <OrderButtons />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <h2 className="font-display font-bold text-3xl text-center">Loved by Local Parents</h2>
        <p className="text-muted text-center mt-1">সন্তানের হাসি আর অভিভাবকদের ভরসা — আমাদের শক্তি</p>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-3xl border border-line bg-white p-6 flex flex-col">
              <div className="text-blush text-lg tracking-widest" aria-hidden>
                ★★★★★
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed flex-1">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold">{t.name}</span>
                <span className="block text-muted text-xs mt-0.5">{t.place}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
        <div className="rounded-3xl bg-blush-deep text-white px-6 py-12 sm:px-12 text-center">
          <h2 className="font-display font-bold text-3xl">Need help choosing a size?</h2>
          <p className="mt-2 text-white/85">
            আপনার সোনামণির বয়স ও হাইট বলুন — আমরা পারফেক্ট সাইজটি বেছে দিব।
          </p>
          <div className="mt-7 flex justify-center">
            <OrderButtons />
          </div>
        </div>
      </section>
    </>
  );
}
