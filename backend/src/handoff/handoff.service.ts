import { Injectable, NotFoundException } from "@nestjs/common";
import type { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessService } from "../business/business.service";
import { RequestHandoffDto } from "./dto/request-handoff.dto";

@Injectable()
export class HandoffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
  ) {}

  async getQueue(user: User) {
    const business = await this.businessService.getForUser(user);
    if (!business) return [];
    return this.prisma.handoffRequest.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      include: { conversation: true },
    });
  }

  async request(user: User, dto: RequestHandoffDto) {
    const business = await this.businessService.requireForUser(user);
    const handoff = await this.prisma.handoffRequest.create({
      data: {
        conversationId: dto.conversationId,
        businessId: business.id,
        reason: dto.reason,
      },
    });
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { status: "handed_off", aiHandled: false },
    });
    return handoff;
  }

  accept(user: User, id: number) {
    return this.prisma.handoffRequest.update({
      where: { id },
      data: { status: "accepted", acceptedBy: user.id },
    });
  }

  async resolve(id: number) {
    const handoff = await this.prisma.handoffRequest.findUnique({
      where: { id },
    });
    if (!handoff) throw new NotFoundException("Request not found");

    await this.prisma.handoffRequest.update({
      where: { id },
      data: { status: "resolved", resolvedAt: new Date() },
    });
    await this.prisma.conversation.update({
      where: { id: handoff.conversationId },
      data: { status: "closed" },
    });

    return { success: true };
  }
}
