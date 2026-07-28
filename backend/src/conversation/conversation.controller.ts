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
import { ConversationService } from "./conversation.service";
import { AddMessageDto } from "./dto/add-message.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";

@Controller("conversations")
export class ConversationController {
  constructor(private readonly service: ConversationService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.service.list(user);
  }

  @Get(":id")
  getById(@CurrentUser() user: User, @Param("id", ParseIntPipe) id: number) {
    return this.service.getById(user, id);
  }

  @Get(":id/messages")
  getMessages(@Param("id", ParseIntPipe) id: number) {
    return this.service.getMessages(id);
  }

  @Post(":id/messages")
  addMessage(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AddMessageDto,
  ) {
    return this.service.addMessage(id, dto);
  }

  @Patch(":id/status")
  markHandled(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.markHandled(id, dto);
  }
}
