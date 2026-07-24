import { Injectable } from "@nestjs/common";
import { and, count, eq, sql } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import {
  businesses,
  conversations,
  handoffRequests,
  messages,
  products,
  type User,
} from "../database/schema";

@Injectable()
export class DashboardService {
  constructor(private readonly database: DatabaseService) {}
  private get db() {
    return this.database.db;
  }

  async getStats(user: User) {
    const [business] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, user.id))
      .limit(1);

    if (!business) {
      return {
        hasBusiness: false,
        totalConversations: 0,
        activeConversations: 0,
        pendingHandoffs: 0,
        totalProducts: 0,
        totalMessages: 0,
        recentActivity: [],
      };
    }

    const businessId = business.id;

    const [convResult] = await this.db
      .select({ count: count() })
      .from(conversations)
      .where(eq(conversations.businessId, businessId));

    const [activeResult] = await this.db
      .select({ count: count() })
      .from(conversations)
      .where(
        and(
          eq(conversations.businessId, businessId),
          eq(conversations.status, "active"),
        ),
      );

    const [handoffResult] = await this.db
      .select({ count: count() })
      .from(handoffRequests)
      .where(
        and(
          eq(handoffRequests.businessId, businessId),
          eq(handoffRequests.status, "pending"),
        ),
      );

    const [productResult] = await this.db
      .select({ count: count() })
      .from(products)
      .where(eq(products.businessId, businessId));

    const [msgResult] = await this.db
      .select({ count: count() })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(eq(conversations.businessId, businessId));

    const recentConvs = await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.businessId, businessId))
      .orderBy(sql`${conversations.lastMessageAt} DESC`)
      .limit(5);

    const recentActivity = await Promise.all(
      recentConvs.map(async (conv) => {
        const [lastMsg] = await this.db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(sql`${messages.createdAt} DESC`)
          .limit(1);

        return {
          conversationId: conv.id,
          customerName: conv.customerName || conv.customerPhone,
          status: conv.status,
          lastMessage: lastMsg?.content || "",
          lastMessageAt: lastMsg?.createdAt || conv.lastMessageAt,
        };
      }),
    );

    return {
      hasBusiness: true,
      totalConversations: convResult.count,
      activeConversations: activeResult.count,
      pendingHandoffs: handoffResult.count,
      totalProducts: productResult.count,
      totalMessages: msgResult.count,
      recentActivity,
    };
  }
}
