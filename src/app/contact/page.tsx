import { site, waLink } from "@/lib/site";

export const metadata = { title: "Contact" };

const CARDS = [
  {
    title: "Call Us",
    titleBn: "ফোন করুন",
    lines: [site.phoneDisplay],
    href: site.phoneHref,
    cta: "Tap to call",
  },
  {
    title: "WhatsApp",
    titleBn: "হোয়াটসঅ্যাপ",
    lines: [site.phoneDisplay],
    href: waLink("আসসালামু আলাইকুম! আমি পণ্য অর্ডার করতে চাই।"),
    cta: "Message us",
  },
  {
    title: "Visit",
    titleBn: "দোকানে আসুন",
    lines: [...site.addressLines],
    href: site.mapsUrl,
    cta: "Open in Google Maps",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="max-w-2xl">
        <p className="text-blush-deep font-semibold tracking-wide">যোগাযোগ</p>
        <h1 className="font-display font-bold text-4xl leading-tight mt-2">
          We are one call away.
        </h1>
        <p className="text-muted mt-3 leading-relaxed">
          পণ্য সম্পর্কে জানতে, দাম বা স্টক কনফার্ম করতে — যেকোনো সময় কল বা WhatsApp করুন।
          অথবা সরাসরি চলে আসুন চিলাহাটি বাজারে।
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-6 mt-10">
        {CARDS.map((c) => (
          <a
            key={c.title}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group rounded-3xl border border-line bg-white p-7 hover:border-blush transition-colors"
          >
            <h2 className="font-display font-bold text-xl group-hover:text-blush transition-colors">{c.title}</h2>
            <p className="text-sm text-muted">{c.titleBn}</p>
            <div className="mt-4 text-sm space-y-1">
              {c.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <p className="mt-5 text-sm font-semibold text-blush">{c.cta} →</p>
          </a>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12 items-stretch">
        <div className="rounded-3xl border border-line bg-white p-8">
          <h2 className="font-display font-bold text-2xl">Opening Hours</h2>
          <p className="text-sm text-muted mt-1">দোকান খোলার সময়</p>
          <dl className="mt-6 divide-y divide-line text-sm">
            {site.hours.map((h) => (
              <div key={h.days} className="flex justify-between py-3.5">
                <dt className="text-muted">{h.days}</dt>
                <dd className="font-semibold">{h.time}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-muted leading-relaxed">
            Delivery hours may vary on market days and public holidays. ছুটির দিনে সময় পরিবর্তন হতে পারে।
          </p>
        </div>

        <a
          href={site.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-mint/25 via-cream to-sky/25 border border-line p-8 flex flex-col justify-between min-h-[260px]"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, var(--color-mint) 0%, transparent 45%), radial-gradient(circle at 70% 60%, var(--color-sky) 0%, transparent 45%), repeating-linear-gradient(0deg, transparent 0 38px, #ffffff88 38px 39px), repeating-linear-gradient(90deg, transparent 0 38px, #ffffff88 38px 39px)",
            }}
          />
          <div className="relative">
            <h2 className="font-display font-bold text-2xl">Find us at Chilahati Bazar</h2>
            <address className="not-italic mt-3 text-sm leading-relaxed">
              {site.addressLines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
          </div>
          <span className="relative inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold shadow-sm group-hover:bg-blush group-hover:text-white transition-colors">
            Get directions →
          </span>
        </a>
      </div>

      <section className="mt-12 rounded-3xl bg-ink text-paper p-8 sm:p-12">
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl">
              Ready to order? অর্ডার করতে প্রস্তুত?
            </h2>
            <p className="mt-2 text-paper/70 text-sm leading-relaxed max-w-lg">
              Call or message us with your product, size and address. We confirm stock instantly and
              arrange delivery — cash on delivery everywhere we serve.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-max">
            <a
              href={site.phoneHref}
              className="rounded-full bg-blush hover:bg-blush-deep text-white font-semibold px-7 py-3 text-center transition-colors"
            >
              Call {site.phoneDisplay}
            </a>
            <a
              href={waLink("আসসালামু আলাইকুম! আমি পণ্য অর্ডার করতে চাই।")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-paper/40 hover:border-paper font-semibold px-7 py-3 text-center transition-colors"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
