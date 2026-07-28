"use client";

import dynamic from "next/dynamic";

// The landing page uses GSAP / three.js / lenis, which touch the DOM — render
// it client-only to avoid SSR pitfalls with those libraries.
const LandingPage = dynamic(() => import("@/components/LandingPage"), {
  ssr: false,
});

export default function Home() {
  return <LandingPage />;
}
