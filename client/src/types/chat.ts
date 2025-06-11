export type ChatChannelType = 'global' | 'alliance' | 'private' | 'system' | 'trade' | 'help';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderLevel?: number;
  senderAlliance?: string;
  recipientId?: string;
  recipientName?: string;
  channel: ChatChannelType;
  content: string;
  timestamp: string;
  isRead: boolean;
  isSystem: boolean;
  isAction: boolean;
  metadata?: {
    itemId?: string;
    coordinates?: { x: number; y: number };
    playerId?: string;
    allianceId?: string;
    [key: string]: any;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  type: ChatChannelType;
  unreadCount: number;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderName: string;
  };
  isMuted: boolean;
  isPinned: boolean;
  participants?: Array<{
    id: string;
    name: string;
    isOnline: boolean;
    avatar?: string;
    level?: number;
    alliance?: string;
  }>;
}

export interface ChatTypingUser {
  id: string;
  name: string;
  until: number;
}

export interface ChatState {
  channels: ChatChannel[];
  activeChannel: string;
  messages: ChatMessage[];
  messageDraft: string;
  isTyping: boolean;
  typingUsers: ChatTypingUser[];
  unreadCounts: Record<string, number>;
  hasMoreMessages: boolean;
  isLoading: boolean;
  isSending: boolean;
  error: Error | null;
}
