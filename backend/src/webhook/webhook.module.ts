import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { AiModule } from "../ai/ai.module";
import { WebhookController } from "./webhook.controller";

@Module({
  imports: [BusinessModule, AiModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
