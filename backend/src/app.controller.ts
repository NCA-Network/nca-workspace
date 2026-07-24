import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

@Controller()
export class AppController {
  @Public()
  @Get("health")
  health() {
    return { ok: true, service: "nca-backend", ts: Date.now() };
  }
}
