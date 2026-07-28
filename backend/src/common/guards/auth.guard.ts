import {
  CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import type { User } from "@prisma/client";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { Session } from "../constants";
import { PrismaService } from "../../prisma/prisma.service";

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
    private readonly prisma: PrismaService,
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

    const user = await this.prisma.user.findUnique({ where: { unionId } });
    if (!user) throw new UnauthorizedException("User not found");

    request.user = user;
    return true;
  }
}
