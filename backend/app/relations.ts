import { relations } from "drizzle-orm";
import {
  users,
  businesses,
  products,
  faqs,
  conversations,
  messages,
  handoffRequests,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, { fields: [businesses.userId], references: [users.id] }),
  products: many(products),
  faqs: many(faqs),
  conversations: many(conversations),
}));

export const productsRelations = relations(products, ({ one }) => ({
  business: one(businesses, {
    fields: [products.businessId],
    references: [businesses.id],
  }),
}));

export const faqsRelations = relations(faqs, ({ one }) => ({
  business: one(businesses, {
    fields: [faqs.businessId],
    references: [businesses.id],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [conversations.businessId],
      references: [businesses.id],
    }),
    messages: many(messages),
    handoffRequest: one(handoffRequests),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const handoffRequestsRelations = relations(
  handoffRequests,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [handoffRequests.conversationId],
      references: [conversations.id],
    }),
    business: one(businesses, {
      fields: [handoffRequests.businessId],
      references: [businesses.id],
    }),
  })
);
