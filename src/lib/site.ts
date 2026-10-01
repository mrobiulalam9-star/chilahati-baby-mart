export const site = {
  name: "Chilahati Ladies and Baby Mart",
  tagline: "Little smiles start here",
  phoneDisplay: "01933-396237",
  phoneHref: "tel:+8801933396237",
  whatsappNumber: "8801933396237",
  email: "hello@chilahatiladiesandbabymart.com",
  addressLines: ["Chilahati Bazar Main Road", "Dimla, Nilphamari 5320"],
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Chilahati+Bazar+Dimla+Nilphamari",
  hours: [
    { days: "Saturday – Thursday", time: "9:00 AM – 9:00 PM" },
    { days: "Friday", time: "3:00 PM – 9:00 PM" },
  ],
};

export function waLink(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const FALLBACK_IMAGE = "/products/placeholder.svg";

/**
 * Swaps a failed image for the placeholder, at most once, so a missing asset
 * never renders as a broken-image icon in client components.
 */
export function handleImageError(
  event: { currentTarget: HTMLImageElement & { dataset?: DOMStringMap } }
) {
  const el = event.currentTarget;
  if (!el || el.dataset?.imgFallbackApplied === "1") return;
  if (el.dataset) el.dataset.imgFallbackApplied = "1";
  el.src = FALLBACK_IMAGE;
}

export function hasPrice(amount: number | null | undefined): boolean {
  if (amount === null || amount === undefined || (amount as unknown) === "") return false;
  return Number.isFinite(Number(amount));
}

export function formatPrice(amount: number | null | undefined): string {
  if (!hasPrice(amount)) return "";
  return `৳${Number(amount).toLocaleString("en-IN")}`;
}
