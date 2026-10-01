"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { CartProvider } from "@/components/CartContext";
import OrderDrawer from "@/components/OrderDrawer";
import type { CatalogueEntry } from "@/lib/catalog";

export default function SiteShell({
  children,
  catalogue,
}: {
  children: React.ReactNode;
  catalogue: CatalogueEntry[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CartProvider catalogue={catalogue}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
      <OrderDrawer />
    </CartProvider>
  );
}