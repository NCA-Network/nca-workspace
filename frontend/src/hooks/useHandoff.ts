"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { HandoffRequest, HandoffWithConversation } from "@/lib/types";

export interface RequestHandoffInput {
  conversationId: number;
  reason?: string;
}

export function useRequestHandoff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RequestHandoffInput) =>
      api.post<HandoffRequest>("/api/handoffs", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["handoffs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** Pending/handled handoff queue for the current business (polls for updates). */
export function useHandoffs() {
  return useQuery({
    queryKey: ["handoffs"],
    queryFn: () => api.get<HandoffWithConversation[]>("/api/handoffs"),
    refetchInterval: 15000,
  });
}

export function useAcceptHandoff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      api.post<HandoffRequest>(`/api/handoffs/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handoffs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useResolveHandoff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      api.post<{ success: boolean }>(`/api/handoffs/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handoffs"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
