import { Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessService } from "../business/business.service";

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
  ) {}

  async getStats(user: User) {
    const business = await this.businessService.getForUser(user);

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

    const [
      totalConversations,
      activeConversations,
      pendingHandoffs,
      totalProducts,
      totalMessages,
      recentConvs,
    ] = await Promise.all([
      this.prisma.conversation.count({ where: { businessId } }),
      this.prisma.conversation.count({ where: { businessId, status: "active" } }),
      this.prisma.handoffRequest.count({ where: { businessId, status: "pending" } }),
      this.prisma.product.count({ where: { businessId } }),
      this.prisma.message.count({ where: { conversation: { businessId } } }),
      this.prisma.conversation.findMany({
        where: { businessId },
        orderBy: { lastMessageAt: "desc" },
        take: 5,
        include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
    ]);

    const recentActivity = recentConvs.map((conv) => {
      const lastMsg = conv.messages[0];
      return {
        conversationId: conv.id,
        customerName: conv.customerName || conv.customerPhone,
        status: conv.status,
        lastMessage: lastMsg?.content || "",
        lastMessageAt: lastMsg?.createdAt || conv.lastMessageAt,
      };
    });

    return {
      hasBusiness: true,
      totalConversations,
      activeConversations,
      pendingHandoffs,
      totalProducts,
      totalMessages,
      recentActivity,
    };
  }
}
