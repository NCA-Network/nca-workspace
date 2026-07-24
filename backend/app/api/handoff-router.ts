import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { handoffRequests, businesses, conversations } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const handoffRouter = createRouter({
  getQueue: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, ctx.user.id))
      .limit(1);

    if (!business) return [];

    const requests = await db
      .select()
      .from(handoffRequests)
      .where(eq(handoffRequests.businessId, business.id))
      .orderBy(desc(handoffRequests.createdAt));

    // Get conversation details for each request
    const enriched = await Promise.all(
      requests.map(async (req) => {
        const [conv] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, req.conversationId))
          .limit(1);
        return { ...req, conversation: conv };
      })
    );

    return enriched;
  }),

  request: authedQuery
    .input(
      z.object({
        conversationId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.userId, ctx.user.id))
        .limit(1);

      if (!business) throw new Error("Business not found");

      const [result] = await db
        .insert(handoffRequests)
        .values({
          conversationId: input.conversationId,
          businessId: business.id,
          reason: input.reason,
        })
        .$returningId();

      // Update conversation status
      await db
        .update(conversations)
        .set({ status: "handed_off", aiHandled: false })
        .where(eq(conversations.id, input.conversationId));

      const [request] = await db
        .select()
        .from(handoffRequests)
        .where(eq(handoffRequests.id, result.id))
        .limit(1);

      return request;
    }),

  accept: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      await db
        .update(handoffRequests)
        .set({
          status: "accepted",
          acceptedBy: ctx.user.id,
        })
        .where(eq(handoffRequests.id, input.id));

      const [request] = await db
        .select()
        .from(handoffRequests)
        .where(eq(handoffRequests.id, input.id))
        .limit(1);

      return request;
    }),

  resolve: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const [request] = await db
        .select()
        .from(handoffRequests)
        .where(eq(handoffRequests.id, input.id))
        .limit(1);

      if (!request) throw new Error("Request not found");

      await db
        .update(handoffRequests)
        .set({ status: "resolved", resolvedAt: new Date() })
        .where(eq(handoffRequests.id, input.id));

      // Close the conversation
      await db
        .update(conversations)
        .set({ status: "closed" })
        .where(eq(conversations.id, request.conversationId));

      return { success: true };
    }),
});
