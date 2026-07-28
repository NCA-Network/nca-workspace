"use client";

import { useState } from "react";
import {
  useConversations,
  useConversation,
  useAddMessage,
  useMarkConversationStatus,
} from "@/hooks/useConversations";
import { useRequestHandoff } from "@/hooks/useHandoff";
import { toast } from "sonner";

export default function ConversationsPage() {
  const { data: conversations, isLoading, error } = useConversations();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: selectedConv } = useConversation(selectedConvId);
  const addMessage = useAddMessage();
  const handoffMutation = useRequestHandoff();
  const markStatus = useMarkConversationStatus();

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId) return;
    addMessage.mutate(
      {
        conversationId: selectedConvId,
        sender: "human",
        content: replyText.trim(),
      },
      { onSuccess: () => setReplyText("") },
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8a8580]">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="font-body text-[#8c4759]">
          Failed to load conversations. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-[#1a1814]" style={{ fontWeight: 400 }}>
          Conversations
        </h1>
        <p className="font-body text-sm text-[#8a8580] mt-1">
          View and manage customer conversations handled by your AI
        </p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e0dcd6] p-12 text-center">
          <p className="font-body text-[#8a8580] mb-4">
            No conversations yet. Start by testing the AI chat below.
          </p>
          <p className="font-body text-xs text-[#c8c4be]">
            Your AI assistant will create conversations when customers message your WhatsApp.
          </p>
        </div>
      ) : (
        <div className="flex gap-6" style={{ height: "calc(100vh - 200px)" }}>
          {/* Conversation List */}
          <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-[#e0dcd6] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-[#e0dcd6]">
              <p className="font-body text-sm font-medium text-[#1a1814]">
                All Conversations ({conversations.length})
              </p>
            </div>
            <div className="flex-1 overflow-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left px-4 py-3 border-b border-[#f0eeea] last:border-0 hover:bg-[#faf9f7] transition-colors ${
                    selectedConvId === conv.id ? "bg-[#faf9f7] border-l-2 border-l-[#d4a574]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-body text-sm font-medium text-[#1a1814]">
                      {conv.customerName || conv.customerPhone}
                    </p>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        conv.status === "active"
                          ? "bg-[#2d6b6b]"
                          : conv.status === "handed_off"
                            ? "bg-[#d4a574]"
                            : "bg-[#c8c4be]"
                      }`}
                    />
                  </div>
                  <p className="font-body text-xs text-[#8a8580] mt-0.5 truncate">
                    {conv.aiHandled ? "AI handled" : "Human agent"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex-1 bg-white rounded-xl border border-[#e0dcd6] flex flex-col overflow-hidden">
            {selectedConv ? (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#e0dcd6] flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm font-medium text-[#1a1814]">
                      {selectedConv.customerName || selectedConv.customerPhone}
                    </p>
                    <p className="font-body text-xs text-[#8a8580]">
                      {selectedConv.status === "active"
                        ? "Active conversation"
                        : selectedConv.status === "handed_off"
                          ? "Handed off to human"
                          : "Closed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConv.status === "active" && (
                      <button
                        onClick={() => {
                          if (confirm("Hand off this conversation to a human agent?")) {
                            handoffMutation.mutate(
                              {
                                conversationId: selectedConv.id,
                                reason: "Agent handoff from dashboard",
                              },
                              { onSuccess: () => toast.success("Handed off to a human agent") },
                            );
                          }
                        }}
                        className="px-4 py-2 border border-[#e0dcd6] rounded-full font-body text-xs font-medium text-[#1a1814] hover:bg-[#ece9e4] transition-colors"
                      >
                        Hand Off
                      </button>
                    )}
                    {selectedConv.status !== "closed" ? (
                      <button
                        onClick={() =>
                          markStatus.mutate(
                            { id: selectedConv.id, status: "closed" },
                            { onSuccess: () => toast.success("Conversation closed") },
                          )
                        }
                        disabled={markStatus.isPending}
                        className="px-4 py-2 border border-[#e0dcd6] rounded-full font-body text-xs font-medium text-[#1a1814] hover:bg-[#ece9e4] transition-colors disabled:opacity-50"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          markStatus.mutate(
                            { id: selectedConv.id, status: "active" },
                            { onSuccess: () => toast.success("Conversation reopened") },
                          )
                        }
                        disabled={markStatus.isPending}
                        className="px-4 py-2 border border-[#e0dcd6] rounded-full font-body text-xs font-medium text-[#1a1814] hover:bg-[#ece9e4] transition-colors disabled:opacity-50"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
                  {selectedConv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "customer" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                          msg.sender === "customer"
                            ? "bg-[#ece9e4] text-[#1a1814] rounded-bl-sm"
                            : msg.sender === "human"
                              ? "bg-[#1a1814] text-[#f5f3ef] rounded-br-sm"
                              : "bg-[rgba(212,165,116,0.15)] text-[#1a1814] rounded-br-sm"
                        }`}
                      >
                        <p className="font-body text-sm">{msg.content}</p>
                        <p className="font-body text-[10px] text-[#8a8580] mt-1">
                          {msg.sender === "customer" ? "Customer" : msg.sender === "human" ? "You" : "AI"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <form onSubmit={handleSendReply} className="px-6 py-4 border-t border-[#e0dcd6] flex gap-3">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 px-4 py-2.5 rounded-full border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574]"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || addMessage.isPending}
                    className="px-6 py-2.5 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-medium hover:bg-[#2d2a24] transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="font-body text-sm text-[#8a8580]">
                  Select a conversation to view messages
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
