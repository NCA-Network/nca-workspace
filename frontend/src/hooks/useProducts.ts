"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export interface CreateProductInput {
  name: string;
  description?: string;
  price: string;
  category?: string;
  imageUrl?: string;
  availability?: boolean;
  stockQuantity?: number;
}

export interface UpdateProductInput {
  id: number;
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  availability?: boolean;
  stockQuantity?: number;
}

/** Lists products; when `search` is non-empty, uses the search endpoint. */
export function useProducts(search?: string) {
  const q = (search ?? "").trim();
  return useQuery({
    queryKey: ["products", q],
    queryFn: () =>
      q
        ? api.get<Product[]>(`/api/products/search?query=${encodeURIComponent(q)}`)
        : api.get<Product[]>("/api/products"),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) =>
      api.post<Product>("/api/products", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateProductInput) =>
      api.patch<Product>(`/api/products/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      api.delete<{ success: boolean }>(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
