# NexusAI Assistant — Backend Design

## Architecture

### Stack

- **Server**: Hono + tRPC 11.x (type-safe API)
- **Database**: Drizzle ORM + MySQL
- **Auth**: OAuth 2.0 (Kimi portal)
- **AI**: OpenAI GPT-4o-mini for responses
- **WhatsApp**: Webhook endpoint (simulated mode for dev)

### Database Schema

| Table              | Purpose                   |
| ------------------ | ------------------------- |
| `users`            | Auth users (auto-created) |
| `businesses`       | Business profile per user |
| `products`         | Product catalog           |
| `faqs`             | FAQ entries               |
| `conversations`    | WhatsApp chat sessions    |
| `messages`         | Individual messages       |
| `handoff_requests` | Human handoff queue       |

### API Routers (tRPC)

| Router         | Operations                                        |
| -------------- | ------------------------------------------------- |
| `auth`         | Login/logout (from init)                          |
| `product`      | create, list, update, delete, search              |
| `faq`          | create, list, update, delete                      |
| `conversation` | list, getById, markHandled                        |
| `handoff`      | request, accept, resolve, getQueue                |
| `ai`           | sendMessage (routes to OpenAI), getConversations  |
| `dashboard`    | getStats (conversation count, handoff queue size) |

### Flow

1. WhatsApp webhook receives message → stores in `messages` + `conversations`
2. Message is routed to AI (OpenAI) with product catalog + FAQ context
3. AI generates response → stored → sent back via WhatsApp
4. If AI confidence low or user requests human → `handoff_requests` created
5. Business owner logs into dashboard → sees handoff queue, conversations, manages products/FAQs
