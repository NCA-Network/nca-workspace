import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3ef]">
      <div className="w-full max-w-sm text-center bg-white rounded-xl border border-[#e0dcd6] p-8">
        <h1 className="font-display text-4xl font-bold text-[#1a1814]">404</h1>
        <p className="font-body text-[#8a8580] mt-2 mb-6">Page not found</p>
        <Link
          href="/"
          className="inline-block w-full py-2.5 bg-[#1a1814] text-[#f5f3ef] rounded-full font-body text-sm font-medium hover:bg-[#2d2a24] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
