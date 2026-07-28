"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Conversation,
  ConversationStatus,
  ConversationWithMessages,
  Message,
  MessageSender,
} from "@/lib/types";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.get<Conversation[]>("/api/conversations"),
    refetchInterval: 15000,
  });
}

export function useConversation(id: number | null) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: () =>
      api.get<ConversationWithMessages>(`/api/conversations/${id}`),
    enabled: !!id,
    refetchInterval: id ? 10000 : false,
  });
}

export interface AddMessageInput {
  conversationId: number;
  sender: MessageSender;
  content: string;
}

export function useAddMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, sender, content }: AddMessageInput) =>
      api.post<Message>(`/api/conversations/${conversationId}/messages`, {
        sender,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export interface MarkStatusInput {
  id: number;
  status: ConversationStatus;
}

export function useMarkConversationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: MarkStatusInput) =>
      api.patch<{ success: boolean }>(`/api/conversations/${id}/status`, {
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
