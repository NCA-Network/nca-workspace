"use client";

import { toast } from "sonner";
import {
  useHandoffs,
  useAcceptHandoff,
  useResolveHandoff,
} from "@/hooks/useHandoff";
import type { HandoffStatus } from "@/lib/types";

const statusStyles: Record<HandoffStatus, string> = {
  pending: "bg-[rgba(140,71,89,0.1)] text-[#8c4759]",
  accepted: "bg-[rgba(212,165,116,0.15)] text-[#b07a3a]",
  resolved: "bg-[rgba(45,107,107,0.1)] text-[#2d6b6b]",
};

export default function HandoffsPage() {
  const { data: handoffs, isLoading, error } = useHandoffs();
  const acceptHandoff = useAcceptHandoff();
  const resolveHandoff = useResolveHandoff();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8a8580]">Loading handoff queue...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8c4759]">Failed to load the handoff queue.</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1000px]">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-[#1a1814]" style={{ fontWeight: 400 }}>
          Handoff Queue
        </h1>
        <p className="font-body text-sm text-[#8a8580] mt-1">
          Conversations escalated from the AI to a human agent
        </p>
      </div>

      {!handoffs || handoffs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e0dcd6] p-12 text-center">
          <p className="font-body text-[#8a8580]">
            No handoff requests. When the AI escalates a conversation, it appears here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {handoffs.map((h) => (
            <div key={h.id} className="bg-white rounded-xl border border-[#e0dcd6] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-body text-sm font-medium text-[#1a1814]">
                      {h.conversation?.customerName ||
                        h.conversation?.customerPhone ||
                        `Conversation #${h.conversationId}`}
                    </p>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-body text-[11px] font-medium ${statusStyles[h.status]}`}
                    >
                      {h.status}
                    </span>
                  </div>
                  <p className="font-body text-sm text-[#8a8580]">
                    {h.reason || "No reason provided"}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {h.status === "pending" && (
                    <button
                      onClick={() =>
                        acceptHandoff.mutate(
                          { id: h.id },
                          { onSuccess: () => toast.success("Handoff accepted") },
                        )
                      }
                      disabled={acceptHandoff.isPending}
                      className="px-4 py-2 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-xs font-medium hover:bg-[#2d2a24] transition-colors disabled:opacity-50"
                    >
                      Accept
                    </button>
                  )}
                  {h.status !== "resolved" && (
                    <button
                      onClick={() =>
                        resolveHandoff.mutate(
                          { id: h.id },
                          { onSuccess: () => toast.success("Handoff resolved") },
                        )
                      }
                      disabled={resolveHandoff.isPending}
                      className="px-4 py-2 border border-[#e0dcd6] text-[#1a1814] rounded-full font-body text-xs font-medium hover:bg-[#ece9e4] transition-colors disabled:opacity-50"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
