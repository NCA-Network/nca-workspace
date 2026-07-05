import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { businesses } from "@db/schema";
import { eq } from "drizzle-orm";

export const businessRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, ctx.user.id))
      .limit(1);
    return business ?? null;
  }),

  create: authedQuery
    .input(
      z.object({
        businessName: z.string().min(1).max(255),
        whatsappNumber: z.string().optional(),
        businessHours: z.string().optional(),
        deliveryInfo: z.string().optional(),
        paymentMethods: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [result] = await db
        .insert(businesses)
        .values({
          userId: ctx.user.id,
          businessName: input.businessName,
          whatsappNumber: input.whatsappNumber,
          businessHours: input.businessHours,
          deliveryInfo: input.deliveryInfo,
          paymentMethods: input.paymentMethods,
        })
        .$returningId();

      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, result.id))
        .limit(1);

      return business;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        businessName: z.string().min(1).max(255).optional(),
        whatsappNumber: z.string().optional(),
        businessHours: z.string().optional(),
        deliveryInfo: z.string().optional(),
        paymentMethods: z.string().optional(),
        aiEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;

      const [existing] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, id))
        .limit(1);

      if (!existing || existing.userId !== ctx.user.id) {
        throw new Error("Business not found");
      }

      await db
        .update(businesses)
        .set(data)
        .where(eq(businesses.id, id));

      const [updated] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, id))
        .limit(1);

      return updated;
    }),
});
