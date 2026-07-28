import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { User } from "@prisma/client";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get("stats")
  getStats(@CurrentUser() user: User) {
    return this.service.getStats(user);
  }
}
