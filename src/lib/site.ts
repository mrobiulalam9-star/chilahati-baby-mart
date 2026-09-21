export const site = {
  name: "Chilahati Ladies and Baby Mart",
  nameBn: "চিলাহাটি লেডিস অ্যান্ড বেবি মার্ট",
  tagline: "Little smiles start here",
  taglineBn: "সোনামণির পোশাকে আপনার বিশ্বস্ত ঠিকানা",
  phoneDisplay: "01933-396237",
  phoneHref: "tel:+8801933396237",
  whatsappNumber: "8801933396237",
  email: "hello@chilahatiladiesandbabymart.com",
  addressLines: ["Chilahati Bazar Main Road", "Dimla, Nilphamari 5320"],
  addressShort: "Chilahati Bazar, Dimla, Nilphamari",
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

export function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}
