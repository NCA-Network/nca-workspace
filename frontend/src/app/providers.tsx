"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import { ApiError } from "@/lib/api";

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    // Session missing/expired → bounce to login (unless already there).
    if (error.status === 401) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
      return;
    }
    toast.error(error.message);
    return;
  }
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }
  toast.error("Something went wrong");
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleError }),
        mutationCache: new MutationCache({ onError: handleError }),
        defaultOptions: { queries: { retry: false } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
