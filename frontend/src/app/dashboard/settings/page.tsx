"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBusiness, useUpdateBusiness } from "@/hooks/useBusiness";

export default function SettingsPage() {
  const { data: business, isLoading, error } = useBusiness();
  const updateBusiness = useUpdateBusiness();

  const [form, setForm] = useState({
    businessName: "",
    whatsappNumber: "",
    businessHours: "",
    deliveryInfo: "",
    paymentMethods: "",
    aiEnabled: true,
  });

  useEffect(() => {
    if (business) {
      setForm({
        businessName: business.businessName || "",
        whatsappNumber: business.whatsappNumber || "",
        businessHours: business.businessHours || "",
        deliveryInfo: business.deliveryInfo || "",
        paymentMethods: business.paymentMethods || "",
        aiEnabled: business.aiEnabled,
      });
    }
  }, [business]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8a8580]">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8c4759]">Failed to load settings.</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-8 max-w-[600px]">
        <div className="bg-white rounded-xl border border-[#e0dcd6] p-8 text-center">
          <p className="font-body text-[#8a8580]">
            Create your business profile from the Overview tab first.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness.mutate(
      {
        id: business.id,
        businessName: form.businessName,
        whatsappNumber: form.whatsappNumber || undefined,
        businessHours: form.businessHours || undefined,
        deliveryInfo: form.deliveryInfo || undefined,
        paymentMethods: form.paymentMethods || undefined,
        aiEnabled: form.aiEnabled,
      },
      { onSuccess: () => toast.success("Settings saved") },
    );
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574] transition-colors";
  const labelCls =
    "block font-body text-sm font-medium text-[#1a1814] mb-1.5";

  return (
    <div className="p-8 max-w-[720px]">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-[#1a1814]" style={{ fontWeight: 400 }}>
          Business Settings
        </h1>
        <p className="font-body text-sm text-[#8a8580] mt-1">
          Update your business profile and AI assistant behavior
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e0dcd6] p-6 space-y-4">
        <div>
          <label className={labelCls}>Business Name *</label>
          <input
            required
            className={inputCls}
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>WhatsApp Number</label>
            <input
              className={inputCls}
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div>
            <label className={labelCls}>Business Hours</label>
            <input
              className={inputCls}
              value={form.businessHours}
              onChange={(e) => setForm({ ...form, businessHours: e.target.value })}
              placeholder="Mon-Fri 9AM-6PM"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Delivery Info</label>
          <input
            className={inputCls}
            value={form.deliveryInfo}
            onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })}
            placeholder="Free delivery within 5 miles"
          />
        </div>
        <div>
          <label className={labelCls}>Payment Methods</label>
          <input
            className={inputCls}
            value={form.paymentMethods}
            onChange={(e) => setForm({ ...form, paymentMethods: e.target.value })}
            placeholder="Cash, Card, Transfer"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[#e0dcd6] px-4 py-3">
          <div>
            <p className="font-body text-sm font-medium text-[#1a1814]">AI Assistant</p>
            <p className="font-body text-xs text-[#8a8580]">
              When off, incoming WhatsApp messages are stored but not auto-answered.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.aiEnabled}
            onClick={() => setForm({ ...form, aiEnabled: !form.aiEnabled })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
              form.aiEnabled ? "bg-[#2d6b6b]" : "bg-[#c8c4be]"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                form.aiEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={updateBusiness.isPending}
            className="px-8 py-2.5 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-semibold hover:bg-[#2d2a24] transition-colors disabled:opacity-50"
          >
            {updateBusiness.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
