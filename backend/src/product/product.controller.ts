import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { User } from "@prisma/client";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SearchProductDto } from "./dto/search-product.dto";

@Controller("products")
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.service.list(user);
  }

  @Get("search")
  search(@CurrentUser() user: User, @Query() q: SearchProductDto) {
    return this.service.search(user, q.query);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateProductDto) {
    return this.service.create(user, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: User,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(user, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: User, @Param("id", ParseIntPipe) id: number) {
    return this.service.remove(user, id);
  }
}
