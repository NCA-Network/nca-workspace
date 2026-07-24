import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { faqs } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const faqRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(faqs)
      .where(eq(faqs.businessId, ctx.user.id))
      .orderBy(desc(faqs.createdAt));
  }),

  create: authedQuery
    .input(
      z.object({
        businessId: z.number(),
        question: z.string().min(1),
        answer: z.string().min(1),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db
        .insert(faqs)
        .values({
          businessId: input.businessId,
          question: input.question,
          answer: input.answer,
          category: input.category,
        })
        .$returningId();

      const [faq] = await db
        .select()
        .from(faqs)
        .where(eq(faqs.id, result.id))
        .limit(1);

      return faq;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        question: z.string().min(1).optional(),
        answer: z.string().min(1).optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      await db.update(faqs).set(data).where(eq(faqs.id, id));

      const [faq] = await db
        .select()
        .from(faqs)
        .where(eq(faqs.id, id))
        .limit(1);

      return faq;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(faqs).where(eq(faqs.id, input.id));
      return { success: true };
    }),
});
