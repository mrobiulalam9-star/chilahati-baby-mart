"use client";

import { useState } from "react";

type Props = {
  images: [string, string];
  name: string;
};

export default function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden border border-line rounded-3xl bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={name} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="mt-4 flex gap-3">
        {images.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            className={`relative w-20 aspect-[3/4] overflow-hidden rounded-xl border-2 transition-colors ${
              active === i ? "border-blush" : "border-line hover:border-muted"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
