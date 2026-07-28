import { Module } from "@nestjs/common";
import { BusinessModule } from "../business/business.module";
import { ConversationController } from "./conversation.controller";
import { ConversationService } from "./conversation.service";

@Module({
  imports: [BusinessModule],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
