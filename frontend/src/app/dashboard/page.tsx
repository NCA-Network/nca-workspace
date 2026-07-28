"use client";

import Link from "next/link";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useBusiness, useCreateBusiness } from "@/hooks/useBusiness";

export default function DashboardHome() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: business } = useBusiness();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8a8580]">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8c4759]">
          Failed to load the dashboard. Please try again.
        </div>
      </div>
    );
  }

  if (!stats?.hasBusiness) {
    return <BusinessSetupPrompt />;
  }

  const statCards = [
    { label: "Total Conversations", value: stats.totalConversations, color: "#2d6b6b" },
    { label: "Active Now", value: stats.activeConversations, color: "#d4a574" },
    { label: "Pending Handoffs", value: stats.pendingHandoffs, color: "#8c4759" },
    { label: "Products", value: stats.totalProducts, color: "#4a5568" },
  ];

  return (
    <div className="p-8 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-[#1a1814]" style={{ fontWeight: 400 }}>
          {business?.businessName || "Dashboard"}
        </h1>
        <p className="font-body text-base text-[#8a8580] mt-1">
          Overview of your AI assistant activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#e0dcd6] p-6">
            <p className="font-body text-sm text-[#8a8580] mb-2">{stat.label}</p>
            <p className="font-display text-3xl" style={{ color: stat.color, fontWeight: 400 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-[#e0dcd6] p-6 mb-8">
        <h2 className="font-body text-lg font-semibold text-[#1a1814] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-medium hover:bg-[#2d2a24] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Add Product
          </Link>
          <Link
            href="/dashboard/faqs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-medium hover:bg-[#2d2a24] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Add FAQ
          </Link>
          <Link
            href="/dashboard/conversations"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#e0dcd6] text-[#1a1814] rounded-full font-body text-sm font-medium hover:bg-[#1a1814] hover:text-[#f5f3ef] transition-colors"
          >
            View Conversations
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-[#e0dcd6] p-6">
        <h2 className="font-body text-lg font-semibold text-[#1a1814] mb-4">Recent Conversations</h2>
        {stats.recentActivity.length === 0 ? (
          <p className="font-body text-sm text-[#8a8580]">
            No conversations yet. Your AI assistant will start handling customer messages once set up.
          </p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.conversationId}
                className="flex items-center gap-4 py-3 border-b border-[#f0eeea] last:border-0"
              >
                <div className="w-9 h-9 rounded-full bg-[#ece9e4] flex items-center justify-center flex-shrink-0">
                  <span className="font-body text-xs font-medium text-[#8a8580]">
                    {(activity.customerName || "C")[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-[#1a1814] truncate">
                    {activity.customerName}
                  </p>
                  <p className="font-body text-xs text-[#8a8580] truncate">
                    {activity.lastMessage}
                  </p>
                </div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full font-body text-[11px] font-medium ${
                    activity.status === "active"
                      ? "bg-[rgba(45,107,107,0.1)] text-[#2d6b6b]"
                      : activity.status === "handed_off"
                        ? "bg-[rgba(212,165,116,0.1)] text-[#d4a574]"
                        : "bg-[rgba(138,133,128,0.1)] text-[#8a8580]"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BusinessSetupPrompt() {
  const createBusiness = useCreateBusiness();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createBusiness.mutate({
      businessName: formData.get("businessName") as string,
      whatsappNumber: (formData.get("whatsappNumber") as string) || undefined,
      businessHours: (formData.get("businessHours") as string) || undefined,
      deliveryInfo: (formData.get("deliveryInfo") as string) || undefined,
      paymentMethods: (formData.get("paymentMethods") as string) || undefined,
    });
  };

  return (
    <div className="p-8 max-w-[600px]">
      <div className="bg-white rounded-xl border border-[#e0dcd6] p-8">
        <h2 className="font-display text-2xl text-[#1a1814] mb-2" style={{ fontWeight: 400 }}>
          Set Up Your Business
        </h2>
        <p className="font-body text-sm text-[#8a8580] mb-6">
          Tell us about your business so the AI assistant can help your customers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">
              Business Name *
            </label>
            <input
              name="businessName"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574] transition-colors"
              placeholder="Your Business Name"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">
              WhatsApp Number
            </label>
            <input
              name="whatsappNumber"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574] transition-colors"
              placeholder="+1 234 567 8900"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">
              Business Hours
            </label>
            <input
              name="businessHours"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574] transition-colors"
              placeholder="Mon-Fri 9AM-6PM, Sat 10AM-4PM"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">
              Delivery Info
            </label>
            <input
              name="deliveryInfo"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574] transition-colors"
              placeholder="Free delivery within 5 miles"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-[#1a1814] mb-1.5">
              Payment Methods
            </label>
            <input
              name="paymentMethods"
              className="w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574] transition-colors"
              placeholder="Cash, Card, PayPal"
            />
          </div>
          <button
            type="submit"
            disabled={createBusiness.isPending}
            className="w-full py-3 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-semibold uppercase tracking-[0.04em] hover:bg-[#2d2a24] transition-colors disabled:opacity-50"
          >
            {createBusiness.isPending ? "Creating..." : "Create Business Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
