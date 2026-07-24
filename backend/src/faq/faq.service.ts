import { Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { faqs, type User } from "../database/schema";
import { CreateFaqDto } from "./dto/create-faq.dto";
import { UpdateFaqDto } from "./dto/update-faq.dto";

@Injectable()
export class FaqService {
  constructor(private readonly database: DatabaseService) {}
  private get db() {
    return this.database.db;
  }

  list(user: User) {
    return this.db
      .select()
      .from(faqs)
      .where(eq(faqs.businessId, user.id))
      .orderBy(desc(faqs.createdAt));
  }

  async create(dto: CreateFaqDto) {
    const [result] = await this.db
      .insert(faqs)
      .values({
        businessId: dto.businessId,
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
      })
      .$returningId();

    const [faq] = await this.db
      .select()
      .from(faqs)
      .where(eq(faqs.id, result.id))
      .limit(1);
    return faq;
  }

  async update(id: number, dto: UpdateFaqDto) {
    await this.db.update(faqs).set({ ...dto }).where(eq(faqs.id, id));

    const [faq] = await this.db
      .select()
      .from(faqs)
      .where(eq(faqs.id, id))
      .limit(1);
    return faq;
  }

  async remove(id: number) {
    await this.db.delete(faqs).where(eq(faqs.id, id));
    return { success: true };
  }
}
