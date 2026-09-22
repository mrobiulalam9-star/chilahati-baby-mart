import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali, Quicksand } from "next/font/google";
import SiteShell from "@/components/SiteShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Chilahati Ladies and Baby Mart",
    template: "%s · Chilahati Ladies and Baby Mart",
  },
  description:
    "Chilahati Ladies and Baby Mart — quality ladies and baby clothing, shoes, caps and accessories at Chilahati Bazar, Dimla. Your trusted address for kids' wear. Call to order with home delivery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoBengali.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
