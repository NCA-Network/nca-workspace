import { authRouter } from "./auth-router";
import { businessRouter } from "./business-router";
import { productRouter } from "./product-router";
import { faqRouter } from "./faq-router";
import { conversationRouter } from "./conversation-router";
import { handoffRouter } from "./handoff-router";
import { aiRouter } from "./ai-router";
import { dashboardRouter } from "./dashboard-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  business: businessRouter,
  product: productRouter,
  faq: faqRouter,
  conversation: conversationRouter,
  handoff: handoffRouter,
  ai: aiRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
