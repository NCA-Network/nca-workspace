import { z } from "zod";
import OpenAI from "openai";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  conversations,
  messages,
  products,
  faqs,
  businesses,
} from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { env } from "./lib/env";

const openai = new OpenAI({
  apiKey: env.openaiApiKey || "sk-dummy",
});

type ProductRow = typeof products.$inferSelect;
type FAQRow = typeof faqs.$inferSelect;
type BusinessRow = typeof businesses.$inferSelect;

export const aiRouter = createRouter({
  chat: authedQuery
    .input(
      z.object({
        message: z.string().min(1),
        conversationId: z.number().optional(),
        customerPhone: z.string().default("+1234567890"),
        customerName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.userId, ctx.user.id))
        .limit(1);

      if (!business) {
        throw new Error("No business profile found. Please create one first.");
      }

      // Get or create conversation
      let conversationId = input.conversationId;
      if (!conversationId) {
        const [conv] = await db
          .insert(conversations)
          .values({
            businessId: business.id,
            customerPhone: input.customerPhone,
            customerName: input.customerName || "Customer",
          })
          .$returningId();
        conversationId = conv.id;
      }

      // Store customer message
      await db.insert(messages).values({
        conversationId,
        sender: "customer",
        content: input.message,
      });

      // Get conversation history
      const history = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(10);

      // Get business products
      const businessProducts = await db
        .select()
        .from(products)
        .where(eq(products.businessId, business.id))
        .limit(20);

      // Get business FAQs
      const businessFaqs = await db
        .select()
        .from(faqs)
        .where(eq(faqs.businessId, business.id))
        .limit(20);

      // Build system prompt
      const systemPrompt = buildSystemPrompt(
        business,
        businessProducts,
        businessFaqs
      );

      // Build message history for OpenAI
      const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...history.reverse().map((msg) => {
          const role: "user" | "assistant" =
            msg.sender === "customer" ? "user" : "assistant";
          return { role, content: msg.content };
        }),
      ];

      // Add current message
      chatMessages.push({ role: "user", content: input.message });

      // Call OpenAI
      let aiResponse: string;
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 500,
        });
        aiResponse =
          completion.choices[0]?.message?.content ||
          "I'm sorry, I couldn't process that. Let me connect you with a team member.";
      } catch {
        aiResponse = generateFallbackResponse(
          input.message,
          businessProducts,
          businessFaqs
        );
      }

      // Store AI response
      await db.insert(messages).values({
        conversationId,
        sender: "ai",
        content: aiResponse,
      });

      // Update conversation
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversationId));

      return {
        conversationId,
        response: aiResponse,
      };
    }),

  getConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

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
});

function buildSystemPrompt(
  business: BusinessRow,
  productList: ProductRow[],
  faqList: FAQRow[]
): string {
  const productsText = productList
    .map(
      (p: ProductRow) =>
        `- ${p.name}: $${p.price}${p.availability ? "" : " (out of stock)"}${p.description ? ` — ${p.description}` : ""}`
    )
    .join("\n");

  const faqsText = faqList
    .map((f: FAQRow) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  return `You are a friendly, professional AI assistant for ${business.businessName} on WhatsApp Business.

BUSINESS INFO:
- Hours: ${business.businessHours || "Not specified"}
- Delivery: ${business.deliveryInfo || "Standard delivery available"}
- Payment: ${business.paymentMethods || "Cash, card, digital payments"}

PRODUCTS:\n${productsText || "No products in catalog yet."}

FAQs:\n${faqsText || "No FAQs configured yet."}

INSTRUCTIONS:
1. Be warm, concise, and helpful — like a great sales assistant
2. Recommend products from the catalog when relevant
3. Answer questions using the FAQ knowledge base
4. If you don't know something, say so and offer to connect them with a human
5. Keep responses under 3-4 sentences for WhatsApp
6. Use emojis sparingly and professionally
7. If asked about pricing, use the exact prices from the product catalog
8. If a product is out of stock, suggest alternatives from the catalog`;
}

function generateFallbackResponse(
  message: string,
  productList: ProductRow[],
  faqList: FAQRow[]
): string {
  const lowerMsg = message.toLowerCase();

  for (const faq of faqList) {
    if (lowerMsg.includes(faq.question.toLowerCase().slice(0, 15))) {
      return faq.answer;
    }
  }

  for (const product of productList) {
    if (lowerMsg.includes(product.name.toLowerCase())) {
      return `${product.name} is available for $${product.price}.${product.availability ? "" : " Currently out of stock."}${product.description ? ` ${product.description}` : ""}`;
    }
  }

  if (
    lowerMsg.includes("price") ||
    lowerMsg.includes("cost") ||
    lowerMsg.includes("how much")
  ) {
    if (productList.length > 0) {
      const list = productList
        .filter((p: ProductRow) => p.availability)
        .map((p: ProductRow) => `${p.name}: $${p.price}`)
        .join(", ");
      return `Here are our products: ${list}. Let me know if you'd like more details about any of them!`;
    }
    return "I'd be happy to help with pricing. Let me connect you with our team for the most accurate information.";
  }

  if (lowerMsg.includes("human") || lowerMsg.includes("agent") || lowerMsg.includes("person")) {
    return "I'll connect you with a team member right away. Please hold on for a moment.";
  }

  return "Thanks for reaching out! I can help you find products, answer questions, or connect you with our team. What would you like to know?";
}
