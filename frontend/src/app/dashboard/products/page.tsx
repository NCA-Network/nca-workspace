"use client";

import { useState } from "react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const { data: products, isLoading, error } = useProducts(search);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    availability: true,
    stockQuantity: 0,
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      availability: true,
      stockQuantity: 0,
    });
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      category: product.category || "",
      imageUrl: product.imageUrl || "",
      availability: product.availability,
      stockQuantity: product.stockQuantity || 0,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description || undefined,
      price: form.price,
      category: form.category || undefined,
      imageUrl: form.imageUrl || undefined,
      availability: form.availability,
      stockQuantity: form.stockQuantity || undefined,
    };

    if (editingId) {
      updateProduct.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            setEditingId(null);
            resetForm();
            setShowForm(false);
          },
        },
      );
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8a8580]">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8c4759]">
          Failed to load products. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-[#1a1814]" style={{ fontWeight: 400 }}>
            Product Catalog
          </h1>
          <p className="font-body text-sm text-[#8a8580] mt-1">
            Manage your products that the AI will recommend to customers
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-medium hover:bg-[#2d2a24] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          {showForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name…"
          className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574]"
        />
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e0dcd6] p-6 mb-6">
          <h3 className="font-body text-lg font-semibold text-[#1a1814] mb-4">
            {editingId ? "Edit Product" : "New Product"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574]"
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">Price *</label>
              <input
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574]"
                placeholder="29.99"
                pattern="^\d+(\.\d{1,2})?$"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574]"
                placeholder="e.g. Electronics, Clothing"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">Stock Quantity</label>
              <input
                type="number"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574] resize-none"
                placeholder="Product description..."
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.checked })}
                  className="w-4 h-4 rounded border-[#e0dcd6]"
                />
                <span className="font-body text-sm text-[#1a1814]">Available</span>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
              className="px-8 py-2.5 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-semibold hover:bg-[#2d2a24] transition-colors disabled:opacity-50"
            >
              {createProduct.isPending || updateProduct.isPending
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Save Product"}
            </button>
          </div>
        </form>
      )}

      {/* Product List */}
      {!products || products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e0dcd6] p-12 text-center">
          <p className="font-body text-[#8a8580] mb-4">No products yet. Add your first product above.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-[#d4a574] text-[#1a1814] rounded-full font-body text-sm font-semibold hover:bg-[#c49464] transition-colors"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e0dcd6] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e0dcd6]">
                <th className="text-left px-6 py-3 font-body text-xs font-medium text-[#8a8580] uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 font-body text-xs font-medium text-[#8a8580] uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 font-body text-xs font-medium text-[#8a8580] uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-3 font-body text-xs font-medium text-[#8a8580] uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-3 font-body text-xs font-medium text-[#8a8580] uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 font-body text-xs font-medium text-[#8a8580] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-[#f0eeea] last:border-0 hover:bg-[#faf9f7]">
                  <td className="px-6 py-4">
                    <p className="font-body text-sm font-medium text-[#1a1814]">{product.name}</p>
                    {product.description && (
                      <p className="font-body text-xs text-[#8a8580] mt-0.5 line-clamp-1">{product.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body text-sm text-[#8a8580]">{product.category || "-"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body text-sm font-medium text-[#1a1814]">${product.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body text-sm text-[#8a8580]">{product.stockQuantity ?? "-"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-body text-[11px] font-medium ${
                        product.availability
                          ? "bg-[rgba(45,107,107,0.1)] text-[#2d6b6b]"
                          : "bg-[rgba(138,133,128,0.1)] text-[#8a8580]"
                      }`}
                    >
                      {product.availability ? "Available" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 rounded-md hover:bg-[#ece9e4] transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8580" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this product?")) {
                            deleteProduct.mutate({ id: product.id });
                          }
                        }}
                        className="p-1.5 rounded-md hover:bg-[#ece9e4] transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8580" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
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
  );
}
