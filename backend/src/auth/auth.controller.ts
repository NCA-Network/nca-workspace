import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Session, OAUTH_STATE_COOKIE } from "../common/constants";
import type { User } from "@prisma/client";
import { AuthService } from "./auth.service";
import { GoogleService } from "./google.service";
import { DevLoginDto } from "./dto/dev-login.dto";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly google: GoogleService,
  ) {}

  @Get("auth/me")
  me(@CurrentUser() user: User) {
    return user;
  }

  @Post("auth/logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(Session.cookieName, { path: "/" });
    return { success: true };
  }

  // ── Google OAuth ──────────────────────────────────────────────

  /** Kicks off Google sign-in: sets a CSRF state cookie and redirects to Google. */
  @Public()
  @Get("auth/google")
  googleStart(@Res() res: Response): void {
    if (!this.google.isConfigured()) {
      res.status(501).json({
        error: "google_not_configured",
        message:
          "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      });
      return;
    }
    const state = randomBytes(16).toString("hex");
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });
    res.redirect(this.google.getAuthUrl(state));
  }

  /** Google redirects here with the code; we verify state, upsert, set session. */
  @Public()
  @Get("auth/google/callback")
  async googleCallback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res() res: Response,
  ): Promise<void> {
    const frontend = process.env.FRONTEND_URL ?? "http://localhost:3000";
    const cookieState = req.cookies?.[OAUTH_STATE_COOKIE];
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });

    if (!code || !state || !cookieState || state !== cookieState) {
      res.redirect(`${frontend}/login?error=oauth_state`);
      return;
    }

    try {
      const profile = await this.google.exchangeCode(code);
      const user = await this.authService.upsertUser(
        `google:${profile.sub}`,
        profile.name,
        profile.email,
        profile.picture,
      );
      const token = await this.authService.signSession(user.unionId);
      this.setSessionCookie(res, token);
      res.redirect(`${frontend}/dashboard`);
    } catch {
      res.redirect(`${frontend}/login?error=oauth_failed`);
    }
  }

  // ── Developer login (non-production) ──────────────────────────

  @Public()
  @Post("auth/dev-login")
  async devLogin(
    @Body() dto: DevLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenException("Developer login is disabled in production.");
    }
    const user = await this.authService.upsertUser(dto.unionId, dto.name, dto.email);
    const token = await this.authService.signSession(user.unionId);
    this.setSessionCookie(res, token);
    return user;
  }

  private setSessionCookie(res: Response, token: string): void {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie(Session.cookieName, token, {
      httpOnly: true,
      path: "/",
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: Session.maxAgeMs,
    });
  }
}
