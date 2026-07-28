"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FAQ } from "@/lib/types";

export interface CreateFaqInput {
  question: string;
  answer: string;
  category?: string;
}

export interface UpdateFaqInput {
  id: number;
  question?: string;
  answer?: string;
  category?: string;
}

export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: () => api.get<FAQ[]>("/api/faqs"),
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFaqInput) => api.post<FAQ>("/api/faqs", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateFaqInput) =>
      api.patch<FAQ>(`/api/faqs/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      api.delete<{ success: boolean }>(`/api/faqs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });
}
