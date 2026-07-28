// REST API response types — mirror the NestJS backend (Drizzle schema).
// Timestamps arrive as ISO strings over JSON (not Date objects).

export type Role = "user" | "admin";

export interface User {
  id: number;
  unionId: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string;
}

export interface Business {
  id: number;
  userId: number;
  businessName: string;
  whatsappNumber: string | null;
  businessHours: string | null;
  deliveryInfo: string | null;
  paymentMethods: string | null;
  aiEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  businessId: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  imageUrl: string | null;
  availability: boolean;
  stockQuantity: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: number;
  businessId: number;
  question: string;
  answer: string;
  category: string | null;
  timesAsked: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ConversationStatus = "active" | "closed" | "handed_off";

export interface Conversation {
  id: number;
  businessId: number;
  customerPhone: string;
  customerName: string | null;
  status: ConversationStatus;
  aiHandled: boolean;
  lastMessageAt: string;
  createdAt: string;
}

export type MessageSender = "customer" | "ai" | "human";

export interface Message {
  id: number;
  conversationId: number;
  sender: MessageSender;
  content: string;
  metadata: string | null;
  createdAt: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export type HandoffStatus = "pending" | "accepted" | "resolved";

export interface HandoffRequest {
  id: number;
  conversationId: number;
  businessId: number;
  reason: string | null;
  status: HandoffStatus;
  acceptedBy: number | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface HandoffWithConversation extends HandoffRequest {
  conversation: Conversation | undefined;
}

export interface RecentActivity {
  conversationId: number;
  customerName: string | null;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageAt: string;
}

export interface DashboardStats {
  hasBusiness: boolean;
  totalConversations: number;
  activeConversations: number;
  pendingHandoffs: number;
  totalProducts: number;
  totalMessages: number;
  recentActivity: RecentActivity[];
}

export interface AiChatResponse {
  conversationId: number;
  response: string;
}
