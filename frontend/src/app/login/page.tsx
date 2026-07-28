"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDevLogin } from "@/hooks/useAuth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 4.7 29.4 2.7 24 2.7 12.3 2.7 2.7 12.3 2.7 24S12.3 45.3 24 45.3c11 0 20.3-8 20.3-21.3 0-1.2-.1-2.3-.7-3.5z"/>
      <path fill="#FF3D00" d="M5.3 14.7l6.6 4.8C13.7 15.6 18.4 12.7 24 12.7c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 4.7 29.4 2.7 24 2.7 16.3 2.7 9.7 7 5.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45.3c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.7 2.5-7.4 2.5-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 41 16.2 45.3 24 45.3z"/>
      <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.2 4.2-4 5.5l6.3 5.3c-.4.4 6.7-4.9 6.7-14.8 0-1.2-.1-2.3-.7-4z"/>
    </svg>
  );
}

export default function LoginPage() {
  const devLogin = useDevLogin();
  const [form, setForm] = useState({
    unionId: "demo-user",
    name: "Demo User",
    email: "demo@example.com",
  });

  // Dev-login is a non-production backend endpoint; only surface it in dev.
  const showDevLogin = process.env.NODE_ENV !== "production";

  const handleDev = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.unionId.trim()) return;
    devLogin.mutate({
      unionId: form.unionId.trim(),
      name: form.name || undefined,
      email: form.email || undefined,
    });
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border border-[#e0dcd6] font-body text-sm text-[#1a1814] focus:outline-none focus:border-[#d4a574]";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3ef] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            className="w-full gap-2"
            size="lg"
            variant="outline"
            onClick={() => {
              // Same-origin: Next proxies /api to the backend, which 302s to Google.
              window.location.href = "/api/auth/google";
            }}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          {showDevLogin && (
            <>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-[#e0dcd6]" />
                dev only
                <span className="h-px flex-1 bg-[#e0dcd6]" />
              </div>

              <form onSubmit={handleDev} className="space-y-3">
                <input
                  className={inputCls}
                  placeholder="unionId"
                  value={form.unionId}
                  onChange={(e) => setForm({ ...form, unionId: e.target.value })}
                />
                <input
                  className={inputCls}
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className={inputCls}
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={devLogin.isPending || !form.unionId.trim()}
                >
                  {devLogin.isPending ? "Signing in..." : "Continue as developer"}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
