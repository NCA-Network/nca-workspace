import { Injectable, NotFoundException } from "@nestjs/common";
import OpenAI from "openai";
import { desc, eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import {
  businesses,
  conversations,
  faqs,
  messages,
  products,
  type Business,
  type FAQ,
  type Product,
  type User,
} from "../database/schema";
import { ChatDto } from "./dto/chat.dto";

@Injectable()
export class AiService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-dummy",
  });

  constructor(private readonly database: DatabaseService) {}
  private get db() {
    return this.database.db;
  }

  async chat(user: User, dto: ChatDto) {
    const [business] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, user.id))
      .limit(1);

    if (!business) {
      throw new NotFoundException(
        "No business profile found. Please create one first.",
      );
    }

    // Get or create conversation
    let conversationId = dto.conversationId;
    if (!conversationId) {
      const [conv] = await this.db
        .insert(conversations)
        .values({
          businessId: business.id,
          customerPhone: dto.customerPhone ?? "+1234567890",
          customerName: dto.customerName || "Customer",
        })
        .$returningId();
      conversationId = conv.id;
    }

    // Store the customer message
    await this.db.insert(messages).values({
      conversationId,
      sender: "customer",
      content: dto.message,
    });

    // Recent history (newest first, then reversed for the prompt)
    const history = await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(10);

    const businessProducts = await this.db
      .select()
      .from(products)
      .where(eq(products.businessId, business.id))
      .limit(20);

    const businessFaqs = await this.db
      .select()
      .from(faqs)
      .where(eq(faqs.businessId, business.id))
      .limit(20);

    const systemPrompt = this.buildSystemPrompt(
      business,
      businessProducts,
      businessFaqs,
    );

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.reverse().map((msg) => {
        const role: "user" | "assistant" =
          msg.sender === "customer" ? "user" : "assistant";
        return { role, content: msg.content };
      }),
    ];
    chatMessages.push({ role: "user", content: dto.message });

    let aiResponse: string;
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 500,
      });
      aiResponse =
        completion.choices[0]?.message?.content ||
        "I'm sorry, I couldn't process that. Let me connect you with a team member.";
    } catch {
      aiResponse = this.generateFallbackResponse(
        dto.message,
        businessProducts,
        businessFaqs,
      );
    }

    await this.db.insert(messages).values({
      conversationId,
      sender: "ai",
      content: aiResponse,
    });

    await this.db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return { conversationId, response: aiResponse };
  }

  async getConversations(user: User) {
    const [business] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, user.id))
      .limit(1);

    if (!business) return [];

    return this.db
      .select()
      .from(conversations)
      .where(eq(conversations.businessId, business.id))
      .orderBy(desc(conversations.lastMessageAt));
  }

  private buildSystemPrompt(
    business: Business,
    productList: Product[],
    faqList: FAQ[],
  ): string {
    const productsText = productList
      .map(
        (p) =>
          `- ${p.name}: $${p.price}${p.availability ? "" : " (out of stock)"}${p.description ? ` — ${p.description}` : ""}`,
      )
      .join("\n");

    const faqsText = faqList
      .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
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

  private generateFallbackResponse(
    message: string,
    productList: Product[],
    faqList: FAQ[],
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
          .filter((p) => p.availability)
          .map((p) => `${p.name}: $${p.price}`)
          .join(", ");
        return `Here are our products: ${list}. Let me know if you'd like more details about any of them!`;
      }
      return "I'd be happy to help with pricing. Let me connect you with our team for the most accurate information.";
    }

    if (
      lowerMsg.includes("human") ||
      lowerMsg.includes("agent") ||
      lowerMsg.includes("person")
    ) {
      return "I'll connect you with a team member right away. Please hold on for a moment.";
    }

    return "Thanks for reaching out! I can help you find products, answer questions, or connect you with our team. What would you like to know?";
  }
}
