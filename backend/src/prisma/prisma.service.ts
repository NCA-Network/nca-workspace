import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client as a Nest provider.
 *
 * We do NOT call $connect() at boot — Prisma connects lazily on the first
 * query, so the app still starts (and serves public routes like /api/health)
 * even without a reachable database.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
