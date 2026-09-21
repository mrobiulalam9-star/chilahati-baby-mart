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

      <div className="grid sm:grid-cols-2 gap-6 mt-10">
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
