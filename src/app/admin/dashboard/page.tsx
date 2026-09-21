"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/products";

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  category: string;
  price: number;
  oldPrice?: number;
  ages: string[];
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  descriptionBn: string;
  featured: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
  source: "static" | "admin";
  hidden?: boolean;
};

const AGE_GROUP_OPTIONS = [
  { value: "0-6m", label: "0–6 months", labelBn: "০–৬ মাস" },
  { value: "6-12m", label: "6–12 months", labelBn: "৬–১২ মাস" },
  { value: "1-2y", label: "1–2 years", labelBn: "১–২ বছর" },
  { value: "2-4y", label: "2–4 years", labelBn: "২–৪ বছর" },
];

type FormData = {
  name: string;
  nameBn: string;
  category: string;
  price: string;
  oldPrice: string;
  ages: string[];
  sizes: string;
  colors: string;
  description: string;
  descriptionBn: string;
  featured: boolean;
  stock: string;
};

const emptyForm: FormData = {
  name: "",
  nameBn: "",
  category: categories[0]?.slug || "clothing",
  price: "",
  oldPrice: "",
  ages: [],
  sizes: "",
  colors: "",
  description: "",
  descriptionBn: "",
  featured: false,
  stock: "50",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" });
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin");
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      showMessage("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/products");
        if (cancelled) return;
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        if (!cancelled) showMessage("Failed to load products", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadedImages((prev) => [...prev, data.url]);
        showMessage("Image uploaded successfully", "success");
      } else {
        showMessage(data.error || "Upload failed", "error");
      }
    } catch {
      showMessage("Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setUploadedImages([]);
    setShowForm(false);
  };

  const handleEdit = (product: AdminProduct) => {
    setForm({
      name: product.name,
      nameBn: product.nameBn,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      ages: [...product.ages],
      sizes: product.sizes.join(", "),
      colors: product.colors.join(", "),
      description: product.description,
      descriptionBn: product.descriptionBn,
      featured: product.featured,
      stock: String(product.stock),
    });
    setEditingId(product.id);
    setUploadedImages(product.images.length ? [...product.images] : []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        nameBn: form.nameBn,
        category: form.category,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        ages: form.ages,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
        images: uploadedImages,
        description: form.description,
        descriptionBn: form.descriptionBn,
        featured: form.featured,
        stock: Number(form.stock),
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showMessage(editingId ? "Product updated!" : "Product created!", "success");
        resetForm();
        fetchProducts();
      } else {
        const data = await res.json();
        showMessage(data.error || "Failed to save product", "error");
      }
    } catch {
      showMessage("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string, images: string[], isStatic: boolean, isHidden?: boolean) => {
    const msg = isHidden
      ? `Restore "${name}" back to the store?`
      : isStatic
        ? `Remove "${name}" from the store? It can be restored later via admin.`
        : `Delete "${name}" permanently?\n\nThis will also delete these image file(s) from disk:\n${images.length > 0 ? images.map((img) => `• ${img}`).join("\n") : "• (no images)"}\n\nThis cannot be undone.`;
    if (!confirm(msg)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const removedCount = data?.filesRemoved?.length ?? 0;
        showMessage(
          isHidden ? "Product restored to store" : isStatic ? "Product removed from store" : removedCount > 0 ? `Product deleted (${removedCount} image file(s) removed from disk)` : "Product deleted",
          "success"
        );
        fetchProducts();
      } else {
        showMessage("Failed", "error");
      }
    } catch {
      showMessage("Network error", "error");
    }
  };

  const toggleAge = (age: string) => {
    setForm((prev) => ({
      ...prev,
      ages: prev.ages.includes(age) ? prev.ages.filter((a) => a !== age) : [...prev.ages, age],
    }));
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.nameBn.includes(searchTerm);
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blush border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar */}
      <header className="bg-white border-b border-line sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <h1 className="font-display font-bold text-lg leading-none">Admin Dashboard</h1>
              <p className="text-xs text-muted">Product Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/shop"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-line rounded-xl hover:border-blush transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              View Store
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-line p-5">
            <p className="text-xs uppercase tracking-widest text-muted">Total Products</p>
            <p className="font-display font-bold text-3xl mt-2">{products.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-line p-5">
            <p className="text-xs uppercase tracking-widest text-muted">Featured</p>
            <p className="font-display font-bold text-3xl mt-2">{products.filter((p) => p.featured).length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-line p-5">
            <p className="text-xs uppercase tracking-widest text-muted">Categories</p>
            <p className="font-display font-bold text-3xl mt-2">{new Set(products.map((p) => p.category)).size}</p>
          </div>
          <div className="bg-white rounded-2xl border border-line p-5">
            <p className="text-xs uppercase tracking-widest text-muted">Low Stock</p>
            <p className="font-display font-bold text-3xl mt-2">{products.filter((p) => p.stock < 10).length}</p>
          </div>
        </div>

        {/* Add Product Button */}
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm({ ...emptyForm });
              setUploadedImages([]);
            }}
            className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blush hover:bg-blush-deep text-white font-semibold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Product
          </button>
        )}

        {/* Product Form */}
        {showForm && (
          <div className="bg-white rounded-3xl border border-line p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 rounded-xl hover:bg-cream transition-colors text-muted hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                    placeholder="e.g. Cotton Romper"
                    required
                  />
                </div>

                {/* Name BN */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Product Name (Bengali)</label>
                  <input
                    type="text"
                    value={form.nameBn}
                    onChange={(e) => setForm((f) => ({ ...f, nameBn: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                    placeholder="e.g. কটন রম্পার"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors bg-white"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} ({c.nameBn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Price (BDT) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                    placeholder="e.g. 450"
                    min="0"
                    required
                  />
                </div>

                {/* Old Price */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Old Price (BDT) - Optional</label>
                  <input
                    type="number"
                    value={form.oldPrice}
                    onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                    placeholder="e.g. 550"
                    min="0"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                    placeholder="e.g. 50"
                    min="0"
                    required
                  />
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={form.sizes}
                    onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                    placeholder="e.g. 0-6m, 6-12m, 1-2y"
                  />
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Colors (comma separated)</label>
                  <input
                    type="text"
                    value={form.colors}
                    onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors"
                    placeholder="e.g. Sky, Cream, Mint"
                  />
                </div>
              </div>

              {/* Age Groups */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-3">Age Groups</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUP_OPTIONS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => toggleAge(g.value)}
                      className={`px-4 py-2 text-sm rounded-xl border transition-colors ${
                        form.ages.includes(g.value)
                          ? "border-blush bg-blush text-white"
                          : "border-line bg-white hover:border-blush"
                      }`}
                    >
                      {g.label} <span className="opacity-80">({g.labelBn})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    form.featured ? "bg-blush" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.featured ? "translate-x-6" : ""
                    }`}
                  />
                </button>
                <span className="text-sm font-medium">Featured Product</span>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-3">Product Images</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-line hover:border-blush transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <span className="text-xs text-muted">Max 5MB · JPG, PNG, WebP</span>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${i + 1}`}
                          className="w-20 h-24 object-cover rounded-xl border border-line"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Description (English)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors min-h-[120px]"
                    placeholder="Product description in English..."
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-2">Description (Bengali)</label>
                  <textarea
                    value={form.descriptionBn}
                    onChange={(e) => setForm((f) => ({ ...f, descriptionBn: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors min-h-[120px]"
                    placeholder="পণ্যের বিবরণ বাংলায়..."
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-4 pt-4 border-t border-line">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-xl bg-blush hover:bg-blush-deep text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "Update Product" : "Upload Product"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3.5 rounded-xl border border-line hover:border-blush font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product List */}
        <div className="bg-white rounded-3xl border border-line overflow-hidden">
          <div className="p-6 border-b border-line">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <h2 className="font-display font-bold text-xl">Products ({filteredProducts.length})</h2>
              <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors text-sm"
                  placeholder="Search products..."
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-line focus:border-blush focus:outline-none transition-colors text-sm bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted text-lg">No products found.</p>
              <p className="text-muted text-sm mt-2">Add your first product to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream/50">
                  <tr>
                    <th className="text-left text-xs uppercase tracking-widest text-muted px-6 py-4 font-medium">Product</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted px-6 py-4 font-medium hidden md:table-cell">Category</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted px-6 py-4 font-medium">Price</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted px-6 py-4 font-medium hidden lg:table-cell">Stock</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted px-6 py-4 font-medium hidden lg:table-cell">Featured</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted px-6 py-4 font-medium">Edit</th>
                    <th className="text-right text-xs uppercase tracking-widest text-muted px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-cream/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-14 object-cover rounded-lg border border-line"
                            />
                          )}
                          <div>
                            <p className={`font-semibold text-sm ${product.hidden ? "line-through opacity-60" : ""}`}>{product.name}</p>
                            <p className="text-xs text-muted">{product.nameBn}</p>
                            {product.hidden ? (
                              <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Removed</span>
                            ) : product.source === "static" ? (
                              <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-muted bg-cream px-1.5 py-0.5 rounded">Bundled</span>
                            ) : (
                              <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-blush bg-blush/10 px-1.5 py-0.5 rounded">Custom</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm">
                          {categories.find((c) => c.slug === product.category)?.name || product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-sm">৳{product.price}</span>
                        {product.oldPrice && (
                          <s className="text-xs text-muted ml-2">৳{product.oldPrice}</s>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className={`text-sm font-medium ${product.stock < 10 ? "text-red-600" : ""}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {product.featured ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blush bg-blush/10 px-2.5 py-1 rounded-full">
                            ★ Featured
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!product.hidden ? (
                          <button
                            onClick={() => handleEdit(product)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors"
                            title="Edit full product details"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!product.hidden && (
                          <a
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-cream transition-colors text-muted hover:text-ink"
                            title="View"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                          )}
                          <button
                            onClick={() => handleDelete(product.id, product.name, product.images, product.source === "static", product.hidden)}
                            className={`p-2 rounded-lg transition-colors ${
                              product.hidden
                                ? "hover:bg-green-50 text-green-600"
                                : "hover:bg-red-50 text-red-600"
                            }`}
                            title={product.hidden ? "Restore to store" : product.source === "static" ? "Remove from store" : "Delete"}
                          >
                            {product.hidden ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
