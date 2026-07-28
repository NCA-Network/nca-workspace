import { Injectable, NotFoundException } from "@nestjs/common";
import type { Faq, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessService } from "../business/business.service";
import { CreateFaqDto } from "./dto/create-faq.dto";
import { UpdateFaqDto } from "./dto/update-faq.dto";

@Injectable()
export class FaqService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
  ) {}

  async list(user: User): Promise<Faq[]> {
    const business = await this.businessService.getForUser(user);
    if (!business) return [];
    return this.prisma.faq.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
    });
  }

  private async requireOwned(user: User, id: number): Promise<Faq> {
    const business = await this.businessService.requireForUser(user);
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq || faq.businessId !== business.id) {
      throw new NotFoundException("FAQ not found");
    }
    return faq;
  }

  async create(user: User, dto: CreateFaqDto): Promise<Faq> {
    const business = await this.businessService.requireForUser(user);
    return this.prisma.faq.create({
      data: {
        businessId: business.id,
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
      },
    });
  }

  async update(user: User, id: number, dto: UpdateFaqDto): Promise<Faq> {
    await this.requireOwned(user, id);
    return this.prisma.faq.update({ where: { id }, data: { ...dto } });
  }

  async remove(user: User, id: number) {
    await this.requireOwned(user, id);
    await this.prisma.faq.delete({ where: { id } });
    return { success: true };
  }
}
