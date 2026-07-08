/**
 * ConversationRepository – interface only, no implementation.
 */
export type ConversationRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface CreateConversationInput {
  participantId: string;
}

export interface UpdateConversationInput {
  participantId?: string;
}

export interface CreateChatMessageInput {
  conversationId: string;
  role: ConversationRole;
  content: string;
  tokenUsage?: number;
  model?: string;
}

export interface ConversationFilters {
  participantId?: string;
}

export interface ConversationRecord {
  id: string;
  participantId: string;
  createdAt: Date;
}

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  role: ConversationRole;
  content: string;
  tokenUsage: number | null;
  model: string | null;
  createdAt: Date;
}

export interface IConversationRepository {
  findById(id: string): Promise<ConversationRecord | null>;
  findMany(filters?: ConversationFilters): Promise<ConversationRecord[]>;
  create(data: CreateConversationInput): Promise<ConversationRecord>;
  delete(id: string): Promise<void>;
  addMessage(data: CreateChatMessageInput): Promise<ChatMessageRecord>;
  getMessages(conversationId: string): Promise<ChatMessageRecord[]>;
}
