"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/site";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-constants";
import type { Order } from "@/lib/order-store";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-sky-50 text-sky-700 border-sky-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
  delivered: [],
  cancelled: ["pending"],
};

function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [busyId, setBusyId] = useState("");
  const [expandedId, setExpandedId] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
      setError("");
    } catch {
      setError("Could not load orders. Check the server is running.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orders");
        if (cancelled) return;
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        const data = await res.json();
        if (!cancelled) setOrders(data.orders || []);
      } catch {
        if (!cancelled) setError("Could not load orders. Check the server is running.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((current) => current.map((o) => (o.id === id ? data.order : o)));
      } else if (res.status === 401) {
        router.push("/admin");
      }
    } finally {
      setBusyId("");
    }
  };

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blush border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-white border-b border-line sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <h1 className="font-display font-bold text-lg leading-none">Orders</h1>
              <p className="text-xs text-muted">Customer orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-line rounded-xl hover:border-blush transition-colors"
            >
              Products
            </a>
            <button
              onClick={load}
              className="px-3 py-2 text-sm font-medium border border-line rounded-xl hover:border-blush transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-line p-5">
            <p className="text-xs uppercase tracking-widest text-muted">Total orders</p>
            <p className="font-display font-bold text-3xl mt-2">{orders.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-line p-5">
            <p className="text-xs uppercase tracking-widest text-muted">Pending</p>
            <p className="font-display font-bold text-3xl mt-2">{counts.pending || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-line p-5">
            <p className="text-xs uppercase tracking-widest text-muted">Delivered</p>
            <p className="font-display font-bold text-3xl mt-2">{counts.delivered || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-line p-5">
            <p className="text-xs uppercase tracking-widest text-muted">Order value</p>
            <p className="font-display font-bold text-3xl mt-2">{formatPrice(revenue)}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(["all", "pending", "confirmed", "delivered", "cancelled"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === option ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-blush"
              }`}
            >
              {option === "all" ? "All" : ORDER_STATUS_LABELS[option]}
              {option !== "all" && counts[option] ? ` (${counts[option]})` : ""}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-line">
            <p className="font-display font-semibold text-lg">No orders here yet</p>
            <p className="mt-1 text-sm text-muted">
              Orders placed from the storefront appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((order) => {
              const expanded = expandedId === order.id;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-line overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expanded ? "" : order.id)}
                    className="w-full px-5 py-4 text-left flex flex-wrap items-center justify-between gap-3 hover:bg-paper transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display font-bold text-base">{order.orderNo}</span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      {order.hasUnpricedItems && (
                        <span className="rounded-full border border-line bg-paper px-2.5 py-0.5 text-xs text-muted">
                          Price on request
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted">{dateLabel(order.createdAt)}</span>
                      <span className="font-semibold tabular-nums">{formatPrice(order.total)}</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className={`text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-line px-5 py-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-muted mb-2">Customer</p>
                          <p className="font-semibold">{order.customer.name}</p>
                          <p className="text-sm">
                            <a href={`tel:${order.customer.phone}`} className="text-blush hover:underline">
                              {order.customer.phone}
                            </a>
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            {order.customer.deliveryType === "home" ? "Home delivery" : "Store pickup"}
                          </p>
                          <p className="mt-1 text-sm">{order.customer.address}</p>
                          {order.customer.note && (
                            <p className="mt-2 rounded-lg bg-paper p-2 text-sm text-muted">
                              Note: {order.customer.note}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-widest text-muted mb-2">Items</p>
                          <ul className="space-y-2 text-sm">
                            {order.items.map((item, index) => (
                              <li key={index} className="flex justify-between gap-3">
                                <span className="text-muted">
                                  {item.quantity} x {item.name}
                                  {[item.size, item.color].filter(Boolean).length > 0 && (
                                    <span className="block text-xs">
                                      {[item.size, item.color].filter(Boolean).join(" / ")}
                                    </span>
                                  )}
                                </span>
                                <span className="whitespace-nowrap tabular-nums">
                                  {item.lineTotal === null ? "On request" : formatPrice(item.lineTotal)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-muted">Subtotal</dt>
                              <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted">Delivery</dt>
                              <dd className="tabular-nums">{formatPrice(order.deliveryCharge)}</dd>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <dt>Total</dt>
                              <dd className="tabular-nums">{formatPrice(order.total)}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      {NEXT_STATUS[order.status].length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                          {NEXT_STATUS[order.status].map((next) => (
                            <button
                              key={next}
                              disabled={busyId === order.id}
                              onClick={() => updateStatus(order.id, next)}
                              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                                next === "cancelled"
                                  ? "border-red-200 text-red-600 hover:bg-red-50"
                                  : "border-blush text-blush-deep hover:bg-blush/5"
                              }`}
                            >
                              Mark as {ORDER_STATUS_LABELS[next].toLowerCase()}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}