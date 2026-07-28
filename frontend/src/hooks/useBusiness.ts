"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Business } from "@/lib/types";

export interface CreateBusinessInput {
  businessName: string;
  whatsappNumber?: string;
  businessHours?: string;
  deliveryInfo?: string;
  paymentMethods?: string;
}

export interface UpdateBusinessInput {
  id: number;
  businessName?: string;
  whatsappNumber?: string;
  businessHours?: string;
  deliveryInfo?: string;
  paymentMethods?: string;
  aiEnabled?: boolean;
}

export function useBusiness() {
  return useQuery({
    queryKey: ["business", "me"],
    queryFn: () => api.get<Business | null>("/api/businesses/me"),
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBusinessInput) =>
      api.post<Business>("/api/businesses", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateBusinessInput) =>
      api.patch<Business>(`/api/businesses/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
