import {
  CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { Session } from "../constants";
import { DatabaseService } from "../../database/database.service";
import { users, type User } from "../../database/schema";

/**
 * Global guard. Verifies the session cookie (JWT), loads the user from the DB,
 * and attaches it to the request. Anonymous/invalid requests get a 401 before
 * any database access; routes marked @Public() skip the guard entirely.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly database: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User; cookies?: Record<string, string> }>();

    const token = request.cookies?.[Session.cookieName];
    if (!token) throw new UnauthorizedException("Authentication required");

    let unionId: string | undefined;
    try {
      const payload = await this.jwt.verifyAsync<{
        sub?: string;
        unionId?: string;
      }>(token);
      unionId = payload.sub ?? payload.unionId;
    } catch {
      throw new UnauthorizedException("Invalid or expired session");
    }
    if (!unionId) throw new UnauthorizedException("Invalid session");

    const [user] = await this.database.db
      .select()
      .from(users)
      .where(eq(users.unionId, unionId))
      .limit(1);
    if (!user) throw new UnauthorizedException("User not found");

    request.user = user;
    return true;
  }
}
