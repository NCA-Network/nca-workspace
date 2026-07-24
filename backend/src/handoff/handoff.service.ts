import { Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import {
  businesses,
  conversations,
  handoffRequests,
  type User,
} from "../database/schema";
import { RequestHandoffDto } from "./dto/request-handoff.dto";

@Injectable()
export class HandoffService {
  constructor(private readonly database: DatabaseService) {}
  private get db() {
    return this.database.db;
  }

  private async businessForUser(user: User) {
    const [business] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, user.id))
      .limit(1);
    return business ?? null;
  }

  async getQueue(user: User) {
    const business = await this.businessForUser(user);
    if (!business) return [];

    const requests = await this.db
      .select()
      .from(handoffRequests)
      .where(eq(handoffRequests.businessId, business.id))
      .orderBy(desc(handoffRequests.createdAt));

    return Promise.all(
      requests.map(async (req) => {
        const [conv] = await this.db
          .select()
          .from(conversations)
          .where(eq(conversations.id, req.conversationId))
          .limit(1);
        return { ...req, conversation: conv };
      }),
    );
  }

  async request(user: User, dto: RequestHandoffDto) {
    const business = await this.businessForUser(user);
    if (!business) throw new NotFoundException("Business not found");

    const [result] = await this.db
      .insert(handoffRequests)
      .values({
        conversationId: dto.conversationId,
        businessId: business.id,
        reason: dto.reason,
      })
      .$returningId();

    await this.db
      .update(conversations)
      .set({ status: "handed_off", aiHandled: false })
      .where(eq(conversations.id, dto.conversationId));

    const [handoff] = await this.db
      .select()
      .from(handoffRequests)
      .where(eq(handoffRequests.id, result.id))
      .limit(1);
    return handoff;
  }

  async accept(user: User, id: number) {
    await this.db
      .update(handoffRequests)
      .set({ status: "accepted", acceptedBy: user.id })
      .where(eq(handoffRequests.id, id));

    const [handoff] = await this.db
      .select()
      .from(handoffRequests)
      .where(eq(handoffRequests.id, id))
      .limit(1);
    return handoff;
  }

  async resolve(id: number) {
    const [handoff] = await this.db
      .select()
      .from(handoffRequests)
      .where(eq(handoffRequests.id, id))
      .limit(1);

    if (!handoff) throw new NotFoundException("Request not found");

    await this.db
      .update(handoffRequests)
      .set({ status: "resolved", resolvedAt: new Date() })
      .where(eq(handoffRequests.id, id));

    await this.db
      .update(conversations)
      .set({ status: "closed" })
      .where(eq(conversations.id, handoff.conversationId));

    return { success: true };
  }
}
