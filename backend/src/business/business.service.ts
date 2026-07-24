import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { businesses, type User } from "../database/schema";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";

@Injectable()
export class BusinessService {
  constructor(private readonly database: DatabaseService) {}
  private get db() {
    return this.database.db;
  }

  async getForUser(user: User) {
    const [business] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, user.id))
      .limit(1);
    return business ?? null;
  }

  async create(user: User, dto: CreateBusinessDto) {
    const [result] = await this.db
      .insert(businesses)
      .values({
        userId: user.id,
        businessName: dto.businessName,
        whatsappNumber: dto.whatsappNumber,
        businessHours: dto.businessHours,
        deliveryInfo: dto.deliveryInfo,
        paymentMethods: dto.paymentMethods,
      })
      .$returningId();

    const [business] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.id, result.id))
      .limit(1);
    return business;
  }

  async update(user: User, id: number, dto: UpdateBusinessDto) {
    const [existing] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    if (!existing || existing.userId !== user.id) {
      throw new NotFoundException("Business not found");
    }

    await this.db.update(businesses).set({ ...dto }).where(eq(businesses.id, id));

    const [updated] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);
    return updated;
  }
}
