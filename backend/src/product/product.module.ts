import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";

@Module({
  imports: [BusinessModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
