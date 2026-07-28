import { Injectable, NotFoundException } from "@nestjs/common";
import type { Business, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  getForUser(user: User): Promise<Business | null> {
    return this.prisma.business.findFirst({ where: { userId: user.id } });
  }

  /** Resolves the caller's business or throws — use in resolvers that need one. */
  async requireForUser(user: User): Promise<Business> {
    const business = await this.getForUser(user);
    if (!business) {
      throw new NotFoundException(
        "No business profile found. Please create one first.",
      );
    }
    return business;
  }

  getById(id: number): Promise<Business | null> {
    return this.prisma.business.findUnique({ where: { id } });
  }

  findByWhatsappNumber(whatsappNumber: string): Promise<Business | null> {
    return this.prisma.business.findFirst({ where: { whatsappNumber } });
  }

  create(user: User, dto: CreateBusinessDto): Promise<Business> {
    return this.prisma.business.create({
      data: {
        userId: user.id,
        businessName: dto.businessName,
        whatsappNumber: dto.whatsappNumber,
        businessHours: dto.businessHours,
        deliveryInfo: dto.deliveryInfo,
        paymentMethods: dto.paymentMethods,
      },
    });
  }

  async update(user: User, id: number, dto: UpdateBusinessDto): Promise<Business> {
    const existing = await this.prisma.business.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      throw new NotFoundException("Business not found");
    }
    return this.prisma.business.update({ where: { id }, data: { ...dto } });
  }
}
