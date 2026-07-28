import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import type { Business, Faq, Product, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessService } from "../business/business.service";
import { ChatDto } from "./dto/chat.dto";

interface ConverseOptions {
  conversationId?: number;
  customerPhone: string;
  customerName?: string;
  message: string;
  /** When false, the customer message is stored but no AI reply is generated. */
  autoReply: boolean;
}

@Injectable()
export class AiService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-dummy",
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
  ) {}

  /** Dashboard "AI simulator" — always replies, regardless of aiEnabled. */
  async chat(user: User, dto: ChatDto) {
    const business = await this.businessService.requireForUser(user);
    return this.converse(business, {
      conversationId: dto.conversationId,
      customerPhone: dto.customerPhone ?? "+1234567890",
      customerName: dto.customerName,
      message: dto.message,
      autoReply: true,
    });
  }

  async getConversations(user: User) {
    const business = await this.businessService.getForUser(user);
    if (!business) return [];
    return this.prisma.conversation.findMany({
      where: { businessId: business.id },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  /**
   * Core message pipeline shared by the dashboard simulator and the WhatsApp
   * webhook: get/create conversation, store the customer message, optionally
   * generate + store an AI reply, and bump the conversation timestamp.
   */
  async converse(
    business: Business,
    opts: ConverseOptions,
  ): Promise<{ conversationId: number; response: string | null }> {
    let conversationId = opts.conversationId;
    if (!conversationId) {
      const conv = await this.prisma.conversation.create({
        data: {
          businessId: business.id,
          customerPhone: opts.customerPhone,
          customerName: opts.customerName || "Customer",
        },
      });
      conversationId = conv.id;
    }

    await this.prisma.message.create({
      data: { conversationId, sender: "customer", content: opts.message },
    });

    let response: string | null = null;

    if (opts.autoReply) {
      const [history, businessProducts, businessFaqs] = await Promise.all([
        this.prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        this.prisma.product.findMany({
          where: { businessId: business.id },
          take: 20,
        }),
        this.prisma.faq.findMany({
          where: { businessId: business.id },
          take: 20,
        }),
      ]);

      const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: this.buildSystemPrompt(business, businessProducts, businessFaqs) },
        ...history.reverse().map((msg) => {
          const role: "user" | "assistant" =
            msg.sender === "customer" ? "user" : "assistant";
          return { role, content: msg.content };
        }),
      ];
      chatMessages.push({ role: "user", content: opts.message });

      try {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 500,
        });
        response =
          completion.choices[0]?.message?.content ||
          "I'm sorry, I couldn't process that. Let me connect you with a team member.";
      } catch {
        response = this.generateFallbackResponse(
          opts.message,
          businessProducts,
          businessFaqs,
        );
      }

      await this.prisma.message.create({
        data: { conversationId, sender: "ai", content: response },
      });
    }

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return { conversationId, response };
  }

  private buildSystemPrompt(
    business: Business,
    productList: Product[],
    faqList: Faq[],
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
    faqList: Faq[],
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
