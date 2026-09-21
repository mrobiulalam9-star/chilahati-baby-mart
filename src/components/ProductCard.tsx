import Link from "next/link";
import { formatPrice } from "@/lib/site";

type Props = {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  images: string[];
  categoryLabel: string;
};

export default function ProductCard({ slug, name, price, oldPrice, images, categoryLabel }: Props) {
  const [main, alt] = images;
  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-white border border-line rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={alt ?? main}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {oldPrice && (
          <span className="absolute top-3 left-3 rounded-full bg-blush text-white text-[11px] font-semibold px-2.5 py-1">
            Save ৳{oldPrice - price}
          </span>
        )}
      </div>
      <div className="mt-3.5 px-0.5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{categoryLabel}</p>
        <h3 className="font-display font-semibold text-base leading-snug mt-1 group-hover:text-blush transition-colors">
          {name}
        </h3>
        <p className="text-sm mt-1">
          <span className="font-semibold">{formatPrice(price)}</span>
          {oldPrice && <s className="ml-2 text-muted text-xs">{formatPrice(oldPrice)}</s>}
        </p>
      </div>
    </Link>
  );
}
