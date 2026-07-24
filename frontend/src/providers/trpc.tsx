import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
// Type-only import of the backend router — erased at build time, gives the
// client end-to-end tRPC types. Resolved via the "@server" path alias.
import type { AppRouter } from "@server/api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

// In dev this is empty and calls hit "/api/trpc" via the Vite proxy.
// In production set VITE_API_URL to the backend's full tRPC endpoint.
const apiUrl = import.meta.env.VITE_API_URL || "/api/trpc";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiUrl,
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
