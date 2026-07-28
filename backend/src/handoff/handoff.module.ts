import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { HandoffController } from "./handoff.controller";
import { HandoffService } from "./handoff.service";

@Module({
  imports: [BusinessModule],
  controllers: [HandoffController],
  providers: [HandoffService],
})
export class HandoffModule {}
