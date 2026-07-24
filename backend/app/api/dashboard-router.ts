import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  conversations,
  messages,
  products,
  handoffRequests,
  businesses,
} from "@db/schema";
import { eq, and, count, sql } from "drizzle-orm";

export const dashboardRouter = createRouter({
  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, ctx.user.id))
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

    // Count conversations
    const [convResult] = await db
      .select({ count: count() })
      .from(conversations)
      .where(eq(conversations.businessId, businessId));

    // Count active conversations
    const [activeResult] = await db
      .select({ count: count() })
      .from(conversations)
      .where(
        and(
          eq(conversations.businessId, businessId),
          eq(conversations.status, "active")
        )
      );

    // Count pending handoffs
    const [handoffResult] = await db
      .select({ count: count() })
      .from(handoffRequests)
      .where(
        and(
          eq(handoffRequests.businessId, businessId),
          eq(handoffRequests.status, "pending")
        )
      );

    // Count products
    const [productResult] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.businessId, businessId));

    // Count total messages
    const [msgResult] = await db
      .select({ count: count() })
      .from(messages)
      .innerJoin(
        conversations,
        eq(messages.conversationId, conversations.id)
      )
      .where(eq(conversations.businessId, businessId));

    // Recent conversations with last message
    const recentConvs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.businessId, businessId))
      .orderBy(sql`${conversations.lastMessageAt} DESC`)
      .limit(5);

    const recentActivity = await Promise.all(
      recentConvs.map(async (conv) => {
        const [lastMsg] = await db
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
      })
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
  }),
});
