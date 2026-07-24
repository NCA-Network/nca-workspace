import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { User } from "../database/schema";
import { FaqService } from "./faq.service";
import { CreateFaqDto } from "./dto/create-faq.dto";
import { UpdateFaqDto } from "./dto/update-faq.dto";

@Controller("faqs")
export class FaqController {
  constructor(private readonly service: FaqService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.service.list(user);
  }

  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.service.create(dto);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateFaqDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
