import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import OrderButtons from "@/components/OrderButtons";
import { categories } from "@/lib/products";
import { getAllProducts } from "@/lib/all-products";

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
  const allProducts = getAllProducts();
  const featured = allProducts.filter((p) => p.featured).slice(0, 8);

return (
    <>
      {/* All Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-3xl">All Products</h2>
            <p className="text-muted mt-1">সব পণ্য — এক নজরে</p>
          </div>
          <span className="hidden sm:inline-block text-sm font-semibold text-muted">{allProducts.length} items</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
          {allProducts.map((p) => (
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
      </section>

      {/* Categories */}
      <section className="bg-cream/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
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
              const sample = allProducts.find((p) => p.category === c.slug);
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
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
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
