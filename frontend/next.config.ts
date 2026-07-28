import type { NextConfig } from "next";

// In dev, proxy /api/* to the NestJS backend so browser calls stay same-origin
// (cookies flow without CORS). In production, either keep them co-hosted behind
// one origin, or set NEXT_PUBLIC_API_URL so the client calls the backend directly.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8787";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
