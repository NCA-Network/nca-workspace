import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleService } from "./google.service";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.APP_SECRET || "insecure-dev-secret-change-me",
      signOptions: { expiresIn: "365d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleService],
  exports: [AuthService],
})
export class AuthModule {}
