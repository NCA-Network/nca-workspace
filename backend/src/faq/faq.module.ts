import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { FaqController } from "./faq.controller";
import { FaqService } from "./faq.service";

@Module({
  imports: [BusinessModule],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
