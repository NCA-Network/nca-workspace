import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { conversations, messages, handoffRequests, businesses } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const conversationRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    // Get user's business first
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, ctx.user.id))
      .limit(1);

    if (!business) return [];

    return db
      .select()
      .from(conversations)
      .where(eq(conversations.businessId, business.id))
      .orderBy(desc(conversations.lastMessageAt));
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.userId, ctx.user.id))
        .limit(1);

      if (!business) return null;

      const [conversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, input.id),
            eq(conversations.businessId, business.id)
          )
        )
        .limit(1);

      if (!conversation) return null;

      const messageList = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.id))
        .orderBy(messages.createdAt);

      return { ...conversation, messages: messageList };
    }),

  getMessages: authedQuery
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(messages.createdAt);
    }),

  addMessage: authedQuery
    .input(
      z.object({
        conversationId: z.number(),
        sender: z.enum(["customer", "ai", "human"]),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const [result] = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          sender: input.sender,
          content: input.content,
        })
        .$returningId();

      // Update conversation lastMessageAt
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, result.id))
        .limit(1);

      return message;
    }),

  markHandled: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["active", "closed", "handed_off"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(conversations)
        .set({ status: input.status })
        .where(eq(conversations.id, input.id));

      // If marking as handed_off, create handoff request
      if (input.status === "handed_off") {
        const [conv] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, input.id))
          .limit(1);

        if (conv) {
          await db.insert(handoffRequests).values({
            conversationId: input.id,
            businessId: conv.businessId,
            reason: "Human agent requested",
          });
        }
      }

      return { success: true };
    }),
});
