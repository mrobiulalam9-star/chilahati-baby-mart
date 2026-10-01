import { site } from "@/lib/site";

const VALUES = [
  {
    title: "Quality First",
    desc: "Every piece is hand-checked for fabric, stitching and safety before it reaches the shelf.",
  },
  {
    title: "Fair Prices",
    desc: "Direct sourcing keeps prices honest — quality babywear should not be a luxury.",
  },
  {
    title: "Parent Trusted",
    desc: "Families across Chilahati and Dimla come back to us for every new arrival.",
  },
];

export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="max-w-3xl">
        <p className="text-blush-deep font-semibold tracking-wide">About Us</p>
        <h1 className="font-display font-bold text-4xl leading-tight mt-2">
          {site.name}
        </h1>
      </header>

      <div className="grid md:grid-cols-2 gap-12 mt-10 items-start">
        <div className="space-y-5 text-muted leading-relaxed">
          <p>
            {site.name} is a trusted online shopping platform offering a wide range of products
            for women, babies and children. Our goal is to provide our customers with quality
            products at affordable prices, along with an easy, convenient and reliable online
            shopping experience.
          </p>
          <p>
            Our collection includes ladies&rsquo; clothing, baby and kids&rsquo; wear, and essential
            products for children&rsquo; essentials. We continuously strive to add new and exciting
            products to our collection based on the preferences and needs of our customers.
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-sky/15 via-cream to-blush/15 border border-line p-8">
          <dl className="grid grid-cols-3 gap-6 text-center">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Products</dt>
              <dd className="font-display font-bold text-3xl text-blush mt-1">200+</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Ages</dt>
              <dd className="font-display font-bold text-3xl text-blush mt-1">0–4y</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Happy families</dt>
              <dd className="font-display font-bold text-3xl text-blush mt-1">1k+</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display font-bold text-3xl">Our Goal</h2>
        <p className="mt-4 max-w-3xl text-muted leading-relaxed">
          Our main goal is to make online shopping easier, safer and more convenient for everyone.
          We want our customers to be able to browse their favorite products from the comfort of
          their homes, place orders easily, and receive their purchases through a reliable delivery
          service.
        </p>
      </section>

      <section className="mt-16 grid sm:grid-cols-3 gap-6">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-3xl border border-line bg-white p-6">
            <h3 className="font-display font-bold text-lg">
              {v.title}
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
