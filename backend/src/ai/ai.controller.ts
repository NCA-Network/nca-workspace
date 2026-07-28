import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { User } from "@prisma/client";
import { AiService } from "./ai.service";
import { ChatDto } from "./dto/chat.dto";

@Controller("ai")
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post("chat")
  chat(@CurrentUser() user: User, @Body() dto: ChatDto) {
    return this.service.chat(user, dto);
  }

  @Get("conversations")
  getConversations(@CurrentUser() user: User) {
    return this.service.getConversations(user);
  }
}
