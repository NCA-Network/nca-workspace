import { Injectable, NotFoundException } from "@nestjs/common";
import type { Product, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessService } from "../business/business.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
  ) {}

  async list(user: User): Promise<Product[]> {
    const business = await this.businessService.getForUser(user);
    if (!business) return [];
    return this.prisma.product.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
    });
  }

  async search(user: User, query: string): Promise<Product[]> {
    const business = await this.businessService.getForUser(user);
    if (!business) return [];
    return this.prisma.product.findMany({
      where: {
        businessId: business.id,
        name: { contains: query, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Loads a product and asserts it belongs to the caller's business. */
  private async requireOwned(user: User, id: number): Promise<Product> {
    const business = await this.businessService.requireForUser(user);
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || product.businessId !== business.id) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  async create(user: User, dto: CreateProductDto): Promise<Product> {
    const business = await this.businessService.requireForUser(user);
    return this.prisma.product.create({
      data: {
        businessId: business.id,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        imageUrl: dto.imageUrl,
        availability: dto.availability ?? true,
        stockQuantity: dto.stockQuantity,
      },
    });
  }

  async update(user: User, id: number, dto: UpdateProductDto): Promise<Product> {
    await this.requireOwned(user, id);
    return this.prisma.product.update({ where: { id }, data: { ...dto } });
  }

  async remove(user: User, id: number) {
    await this.requireOwned(user, id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
