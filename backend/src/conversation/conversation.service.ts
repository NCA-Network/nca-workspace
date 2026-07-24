import { Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import {
  businesses,
  conversations,
  handoffRequests,
  messages,
  type User,
} from "../database/schema";
import { AddMessageDto } from "./dto/add-message.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";

@Injectable()
export class ConversationService {
  constructor(private readonly database: DatabaseService) {}
  private get db() {
    return this.database.db;
  }

  private async businessForUser(user: User) {
    const [business] = await this.db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, user.id))
      .limit(1);
    return business ?? null;
  }

  async list(user: User) {
    const business = await this.businessForUser(user);
    if (!business) return [];

    return this.db
      .select()
      .from(conversations)
      .where(eq(conversations.businessId, business.id))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async getById(user: User, id: number) {
    const business = await this.businessForUser(user);
    if (!business) return null;

    const [conversation] = await this.db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.businessId, business.id),
        ),
      )
      .limit(1);

    if (!conversation) return null;

    const messageList = await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    return { ...conversation, messages: messageList };
  }

  getMessages(conversationId: number) {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async addMessage(conversationId: number, dto: AddMessageDto) {
    const [result] = await this.db
      .insert(messages)
      .values({
        conversationId,
        sender: dto.sender,
        content: dto.content,
      })
      .$returningId();

    await this.db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    const [message] = await this.db
      .select()
      .from(messages)
      .where(eq(messages.id, result.id))
      .limit(1);
    return message;
  }

  async markHandled(id: number, dto: UpdateStatusDto) {
    await this.db
      .update(conversations)
      .set({ status: dto.status })
      .where(eq(conversations.id, id));

    if (dto.status === "handed_off") {
      const [conv] = await this.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, id))
        .limit(1);

      if (conv) {
        await this.db.insert(handoffRequests).values({
          conversationId: id,
          businessId: conv.businessId,
          reason: "Human agent requested",
        });
      }
    }

    return { success: true };
  }
}
