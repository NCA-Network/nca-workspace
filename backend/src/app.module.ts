import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AuthGuard } from "./common/guards/auth.guard";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { BusinessModule } from "./business/business.module";
import { ProductModule } from "./product/product.module";
import { FaqModule } from "./faq/faq.module";
import { ConversationModule } from "./conversation/conversation.module";
import { HandoffModule } from "./handoff/handoff.module";
import { AiModule } from "./ai/ai.module";
import { DashboardModule } from "./dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    BusinessModule,
    ProductModule,
    FaqModule,
    ConversationModule,
    HandoffModule,
    AiModule,
    DashboardModule,
  ],
  controllers: [AppController],
  // Auth is on by default everywhere; mark exceptions with @Public().
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
