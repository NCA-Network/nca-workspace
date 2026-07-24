import { Injectable } from "@nestjs/common";
import { and, desc, eq, like } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { products, type User } from "../database/schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductService {
  constructor(private readonly database: DatabaseService) {}
  private get db() {
    return this.database.db;
  }

  list(user: User) {
    return this.db
      .select()
      .from(products)
      .where(eq(products.businessId, user.id))
      .orderBy(desc(products.createdAt));
  }

  search(user: User, query: string) {
    return this.db
      .select()
      .from(products)
      .where(
        and(eq(products.businessId, user.id), like(products.name, `%${query}%`)),
      )
      .orderBy(desc(products.createdAt));
  }

  async create(dto: CreateProductDto) {
    const [result] = await this.db
      .insert(products)
      .values({
        businessId: dto.businessId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        imageUrl: dto.imageUrl,
        availability: dto.availability ?? true,
        stockQuantity: dto.stockQuantity,
      })
      .$returningId();

    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, result.id))
      .limit(1);
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.db.update(products).set({ ...dto }).where(eq(products.id, id));

    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return product;
  }

  async remove(id: number) {
    await this.db.delete(products).where(eq(products.id, id));
    return { success: true };
  }
}
