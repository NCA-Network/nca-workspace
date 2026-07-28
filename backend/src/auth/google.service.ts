import { Injectable, UnauthorizedException } from "@nestjs/common";

export interface GoogleProfile {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Minimal Google OAuth 2.0 (Authorization Code) helper using Google's public
 * endpoints — no SDK. We exchange the code server-to-server over TLS and read
 * the profile from the userinfo endpoint, so no id_token signature check needed.
 */
@Injectable()
export class GoogleService {
  private get clientId() {
    return process.env.GOOGLE_CLIENT_ID ?? "";
  }
  private get clientSecret() {
    return process.env.GOOGLE_CLIENT_SECRET ?? "";
  }
  private get redirectUri() {
    return (
      process.env.GOOGLE_REDIRECT_URI ??
      `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/api/auth/google/callback`
    );
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      include_granted_scopes: "true",
      prompt: "select_account",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<GoogleProfile> {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      throw new UnauthorizedException("Google token exchange failed");
    }
    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) {
      throw new UnauthorizedException("No access token returned by Google");
    }

    const infoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    if (!infoRes.ok) {
      throw new UnauthorizedException("Failed to fetch Google profile");
    }
    const info = (await infoRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    return {
      sub: info.sub,
      email: info.email,
      name: info.name,
      picture: info.picture,
    };
  }
}
