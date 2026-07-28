"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AiChatResponse } from "@/lib/types";

export interface AiChatInput {
  message: string;
  conversationId?: number;
  customerPhone?: string;
  customerName?: string;
}

export function useAiChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AiChatInput) =>
      api.post<AiChatResponse>("/api/ai/chat", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
