import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Session } from "../common/constants";
import type { User } from "../database/schema";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  /**
   * OAuth callback. Kimi's token/userinfo endpoints are platform-specific and
   * were never committed to this repo, so this returns a clear 501 rather than
   * crash. Wire the real exchange where marked; then it will set the session
   * cookie via authService.signSession() and redirect to the frontend.
   */
  @Public()
  @Get("oauth/callback")
  oauthCallback(
    @Query("code") code: string | undefined,
    @Res() res: Response,
  ): void {
    const { KIMI_AUTH_URL, APP_ID, APP_SECRET } = process.env;
    if (!code || !KIMI_AUTH_URL || !APP_ID || !APP_SECRET) {
      res.status(501).json({
        error: "oauth_not_configured",
        message:
          "OAuth callback reached but Kimi OAuth is not configured. Set KIMI_AUTH_URL / APP_ID / APP_SECRET and implement the token exchange in auth.controller.ts.",
      });
      return;
    }

    // TODO(kimi): exchange `code` at KIMI_AUTH_URL for tokens, resolve the
    // unionId/profile, upsert into `users`, then:
    //   const token = await this.authService.signSession(unionId);
    //   res.cookie(Session.cookieName, token, { httpOnly: true, path: "/", ... });
    //   return res.redirect(process.env.FRONTEND_URL ?? "http://localhost:3000");
    res.status(501).json({
      error: "oauth_exchange_not_implemented",
      message:
        "Authorization code received, but the Kimi token exchange is a stub.",
    });
  }
}
