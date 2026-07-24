import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = import.meta.dirname

// During `npm run dev` the API lives in the separate backend app. Proxy /api
// (tRPC + the OAuth callback) to it so browser calls stay same-origin and
// cookies flow without CORS friction.
const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:8787"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Type-only bridge to the backend for end-to-end tRPC types.
      // These imports are erased at build time (import type ...).
      "@server": path.resolve(__dirname, "../backend"),
      "@contracts": path.resolve(__dirname, "../backend/contracts"),
      "@db": path.resolve(__dirname, "../backend/db"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
})
