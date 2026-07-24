import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  /** Signs a session JWT for a verified unionId (used by the OAuth callback). */
  signSession(unionId: string): Promise<string> {
    return this.jwt.signAsync({ sub: unionId });
  }
}
