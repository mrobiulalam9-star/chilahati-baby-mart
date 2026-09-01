import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-28 text-center">
      <p className="font-display font-bold text-7xl text-blush">404</p>
      <h1 className="font-display font-semibold text-2xl mt-4">This page wandered off.</h1>
      <p className="text-muted mt-2">খুঁজে পাওয়া যায়নি — চলুন ঘরে ফিরে আবার খুঁজি।</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-blush hover:bg-blush-deep text-white font-semibold px-7 py-3 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
