import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /** Signs a session JWT for a verified unionId. */
  signSession(unionId: string): Promise<string> {
    return this.jwt.signAsync({ sub: unionId });
  }

  /**
   * Finds a user by unionId or creates one, refreshing profile fields and the
   * last-sign-in timestamp when provided. Used by dev-login and Google sign-in.
   */
  upsertUser(
    unionId: string,
    name?: string | null,
    email?: string | null,
    avatar?: string | null,
  ): Promise<User> {
    return this.prisma.user.upsert({
      where: { unionId },
      update: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(avatar ? { avatar } : {}),
        lastSignInAt: new Date(),
      },
      create: {
        unionId,
        name: name ?? null,
        email: email ?? null,
        avatar: avatar ?? null,
      },
    });
  }
}
