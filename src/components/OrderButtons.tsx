import { site, waLink } from "@/lib/site";

type Props = {
  productName?: string;
  price?: number;
};

export function CallButton() {
  return (
    <a
      href={site.phoneHref}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-blush hover:bg-blush-deep text-white font-semibold px-6 py-3.5 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2z" />
      </svg>
      কল করে অর্ডার করুন
    </a>
  );
}

export function WhatsAppButton({ productName, price }: Props) {
  const message = productName
    ? `আসসালামু আলাইকুম! আমি "${productName}"${price ? ` (${price} টাকা)` : ""} অর্ডার করতে চাই।`
    : "আসসালামু আলাইকুম! আমি পণ্য সম্পর্কে জানতে চাই।";
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-mint text-mint hover:bg-mint hover:text-white font-semibold px-6 py-3.5 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91A9.86 9.86 0 0 0 12.04 2zm5.8 14.03c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.89-.12-.44-.14-1-.32-1.71-.63-3.02-1.3-4.99-4.34-5.14-4.54-.15-.2-1.23-1.63-1.23-3.11 0-1.48.78-2.21 1.05-2.51.28-.3.6-.38.8-.38.2 0 .4 0 .58.01.18.01.43-.07.68.52.25.6.85 2.07.93 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.76 1.26 1.64 2.04 1.13 1 2.08 1.31 2.37 1.46.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.72-.18 1.42z" />
      </svg>
      WhatsApp এ অর্ডার
    </a>
  );
}

export function OrderButtons({ productName, price }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <CallButton />
      <WhatsAppButton productName={productName} price={price} />
    </div>
  );
}

export default OrderButtons;
