import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import OrderButtons from "@/components/OrderButtons";
import { categories, categoryBySlug, AGE_GROUPS } from "@/lib/products";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/all-products";
import { formatPrice } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return { title: product ? product.name : "Product" };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = categoryBySlug(product.category);
  const related = getRelatedProducts(product);
  const ageLabels = AGE_GROUPS.filter((g) => product.ages.includes(g.value));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <nav className="text-xs uppercase tracking-widest text-muted mb-8 flex gap-2 flex-wrap">
        <Link href="/" className="hover:text-blush">
          Home
        </Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-blush">
          {category?.name}
        </Link>
        <span>/</span>
        <span className="text-ink normal-case">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-start">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-28">
          <p className="text-xs uppercase tracking-[0.3em] text-blush-deep mb-3">{category?.name}</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl leading-tight">{product.name}</h1>

          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <>
                <s className="text-muted text-base">{formatPrice(product.oldPrice)}</s>
                <span className="rounded-full bg-blush/10 text-blush-deep text-xs font-semibold px-2.5 py-1">
                  Save {formatPrice(product.oldPrice - product.price)}
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-muted mt-1">Price in Taka · Cash on delivery available</p>

          <div className="mt-7 space-y-4 text-sm">
            <p>
              <span className="font-semibold">Age:</span>{" "}
              {ageLabels.map((g) => g.label).join(", ")}
            </p>
            <p>
              <span className="font-semibold">Available sizes:</span>{" "}
              {product.sizes.map((s) => (
                <span key={s} className="inline-block border border-line rounded-full px-3 py-1 mr-2 mt-1 bg-white">
                  {s}
                </span>
              ))}
            </p>
            <p>
              <span className="font-semibold">Colors in stock:</span> {product.colors.join(", ")}
            </p>
          </div>

          <p className="mt-6 text-muted leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <OrderButtons productName={`${product.name} — ${formatPrice(product.price)}`} />
          </div>
          <p className="text-xs text-muted mt-4">
            Stock is limited — please confirm availability by phone before visiting.
          </p>

          <div className="mt-9 divide-y divide-line border-t border-line text-sm">
            <details className="group py-4">
              <summary className="cursor-pointer text-xs uppercase tracking-[0.25em] select-none">
                Details &amp; Care
              </summary>
              <p className="pt-3 text-muted leading-relaxed">
                Skin-friendly fabric, tested stitching and baby-safe colors. Gentle machine wash or hand
                wash in cold water; dry in shade.
              </p>
            </details>
            <details className="group py-4">
              <summary className="cursor-pointer text-xs uppercase tracking-[0.25em] select-none">
                Delivery &amp; Exchange
              </summary>
              <p className="pt-3 text-muted leading-relaxed">
                Home delivery across Chilahati bazar area; courier delivery all over Bangladesh (charges
                apply). Wrong size? Exchange within 3 days with the receipt.
              </p>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display font-bold text-3xl mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {related.map((p) => (
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
      )}
    </div>
  );
}
