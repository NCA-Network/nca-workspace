import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { User } from "@prisma/client";
import { HandoffService } from "./handoff.service";
import { RequestHandoffDto } from "./dto/request-handoff.dto";

@Controller("handoffs")
export class HandoffController {
  constructor(private readonly service: HandoffService) {}

  @Get()
  getQueue(@CurrentUser() user: User) {
    return this.service.getQueue(user);
  }

  @Post()
  request(@CurrentUser() user: User, @Body() dto: RequestHandoffDto) {
    return this.service.request(user, dto);
  }

  @Post(":id/accept")
  accept(@CurrentUser() user: User, @Param("id", ParseIntPipe) id: number) {
    return this.service.accept(user, id);
  }

  @Post(":id/resolve")
  resolve(@Param("id", ParseIntPipe) id: number) {
    return this.service.resolve(id);
  }
}
