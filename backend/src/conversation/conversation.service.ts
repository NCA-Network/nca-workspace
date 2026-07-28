import { Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessService } from "../business/business.service";
import { AddMessageDto } from "./dto/add-message.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
  ) {}

  async list(user: User) {
    const business = await this.businessService.getForUser(user);
    if (!business) return [];
    return this.prisma.conversation.findMany({
      where: { businessId: business.id },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  async getById(user: User, id: number) {
    const business = await this.businessService.getForUser(user);
    if (!business) return null;
    return this.prisma.conversation.findFirst({
      where: { id, businessId: business.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  getMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  async addMessage(conversationId: number, dto: AddMessageDto) {
    const message = await this.prisma.message.create({
      data: { conversationId, sender: dto.sender, content: dto.content },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    return message;
  }

  async markHandled(id: number, dto: UpdateStatusDto) {
    const conversation = await this.prisma.conversation.update({
      where: { id },
      data: { status: dto.status },
    });

    if (dto.status === "handed_off") {
      await this.prisma.handoffRequest.create({
        data: {
          conversationId: id,
          businessId: conversation.businessId,
          reason: "Human agent requested",
        },
      });
    }

    return { success: true };
  }
}
