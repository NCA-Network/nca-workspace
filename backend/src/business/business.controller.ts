import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { User } from "@prisma/client";
import { BusinessService } from "./business.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";

@Controller("businesses")
export class BusinessController {
  constructor(private readonly service: BusinessService) {}

  @Get("me")
  getMine(@CurrentUser() user: User) {
    return this.service.getForUser(user);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateBusinessDto) {
    return this.service.create(user, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: User,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.service.update(user, id, dto);
  }
}
