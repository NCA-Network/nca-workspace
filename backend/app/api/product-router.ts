import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products } from "@db/schema";
import { eq, and, like, desc } from "drizzle-orm";

export const productRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userProducts = await db
      .select()
      .from(products)
      .where(eq(products.businessId, ctx.user.id))
      .orderBy(desc(products.createdAt));
    return userProducts;
  }),

  search: authedQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.businessId, ctx.user.id),
            like(products.name, `%${input.query}%`)
          )
        )
        .orderBy(desc(products.createdAt));
      return results;
    }),

  create: authedQuery
    .input(
      z.object({
        businessId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        availability: z.boolean().default(true),
        stockQuantity: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db
        .insert(products)
        .values({
          businessId: input.businessId,
          name: input.name,
          description: input.description,
          price: input.price,
          category: input.category,
          imageUrl: input.imageUrl,
          availability: input.availability,
          stockQuantity: input.stockQuantity,
        })
        .$returningId();

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, result.id))
        .limit(1);

      return product;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        availability: z.boolean().optional(),
        stockQuantity: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      await db.update(products).set(data).where(eq(products.id, id));

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      return product;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
