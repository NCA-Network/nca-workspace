"use client";

import { useState } from "react";
import {
  useFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
} from "@/hooks/useFaqs";
import type { FAQ } from "@/lib/types";

export default function FAQsPage() {
  const { data: faqs, isLoading, error } = useFaqs();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const [form, setForm] = useState({ question: "", answer: "", category: "" });

  const resetForm = () => setForm({ question: "", answer: "", category: "" });

  const handleEdit = (faq: FAQ) => {
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      question: form.question,
      answer: form.answer,
      category: form.category || undefined,
    };

    if (editingId) {
      updateFaq.mutate(
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
      createFaq.mutate(data, {
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
        <div className="font-body text-[#8a8580]">Loading FAQs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8c4759]">
          Failed to load FAQs. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-[#1a1814]" style={{ fontWeight: 400 }}>
            FAQ Management
          </h1>
          <p className="font-body text-sm text-[#8a8580] mt-1">
            Create and manage FAQs that your AI assistant will use to answer customer questions
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
          {showForm ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e0dcd6] p-6 mb-6">
          <h3 className="font-body text-lg font-semibold text-[#1a1814] mb-4">
            {editingId ? "Edit FAQ" : "New FAQ"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">Question *</label>
              <input
                required
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574]"
                placeholder="What are your business hours?"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">Answer *</label>
              <textarea
                required
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574] resize-none"
                placeholder="We're open Monday through Friday, 9 AM to 6 PM..."
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574]"
                placeholder="e.g. Hours, Delivery, Payments"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={createFaq.isPending || updateFaq.isPending}
              className="px-8 py-2.5 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-semibold hover:bg-[#2d2a24] transition-colors disabled:opacity-50"
            >
              {createFaq.isPending || updateFaq.isPending
                ? "Saving..."
                : editingId
                  ? "Update FAQ"
                  : "Save FAQ"}
            </button>
          </div>
        </form>
      )}

      {/* FAQ List */}
      {!faqs || faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e0dcd6] p-12 text-center">
          <p className="font-body text-[#8a8580] mb-4">No FAQs yet. Add your first FAQ above.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-[#d4a574] text-[#1a1814] rounded-full font-body text-sm font-semibold hover:bg-[#c49464] transition-colors"
          >
            Add Your First FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl border border-[#e0dcd6] p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-body text-sm font-medium text-[#1a1814]">{faq.question}</h3>
                    {faq.category && (
                      <span className="px-2 py-0.5 bg-[#ece9e4] rounded-full font-body text-[10px] text-[#8a8580] font-medium">
                        {faq.category}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-[#8a8580] leading-relaxed">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="p-1.5 rounded-md hover:bg-[#ece9e4] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8580" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this FAQ?")) {
                        deleteFaq.mutate({ id: faq.id });
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-[#ece9e4] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8580" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
