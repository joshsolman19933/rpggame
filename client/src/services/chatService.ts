import api from './api';
import { ChatMessage, ChatChannel } from '../types/chat';

const CHAT_BASE_URL = '/api/chat';

export const chatService = {
  // Get all available channels
  getChannels: async (): Promise<ChatChannel[]> => {
    const response = await api.get(`${CHAT_BASE_URL}/channels`);
    return response.data;
  },

  // Get messages for a specific channel
  getMessages: async (
    channelId: string, 
    options: { page?: number; limit?: number } = {}
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean; total: number }> => {
    const { page = 0, limit = 50 } = options;
    const response = await api.get(`${CHAT_BASE_URL}/messages/${channelId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Send a message to a channel
  sendMessage: async (data: {
    channel: string;
    content: string;
    recipientId?: string;
    isAction?: boolean;
    metadata?: Record<string, any>;
  }): Promise<ChatMessage> => {
    const response = await api.post(`${CHAT_BASE_URL}/messages`, data);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (messageIds: string[]): Promise<void> => {
    await api.post(`${CHAT_BASE_URL}/messages/mark-read`, { messageIds });
  },

  // Join a channel
  joinChannel: async (channelId: string, password?: string): Promise<ChatChannel> => {
    const response = await api.post(`${CHAT_BASE_URL}/channels/join`, { channelId, password });
    return response.data;
  },

  // Leave a channel
  leaveChannel: async (channelId: string): Promise<void> => {
    await api.post(`${CHAT_BASE_URL}/channels/leave`, { channelId });
  },

  // Create a new channel
  createChannel: async (data: {
    name: string;
    type: 'public' | 'private' | 'alliance';
    password?: string;
    topic?: string;
  }): Promise<ChatChannel> => {
    const response = await api.post(`${CHAT_BASE_URL}/channels`, data);
    return response.data;
  },

  // Mute/unmute a channel
  toggleMuteChannel: async (channelId: string, muted: boolean): Promise<void> => {
    await api.patch(`${CHAT_BASE_URL}/channels/${channelId}/mute`, { muted });
  },

  // Get unread message counts
  getUnreadCounts: async (): Promise<Record<string, number>> => {
    const response = await api.get(`${CHAT_BASE_URL}/unread-counts`);
    return response.data;
  },

  // Search for messages
  searchMessages: async (query: string, channelId?: string): Promise<ChatMessage[]> => {
    const response = await api.get(`${CHAT_BASE_URL}/search`, {
      params: { q: query, channelId }
    });
    return response.data;
  },

  // Get channel info
  getChannelInfo: async (channelId: string): Promise<ChatChannel> => {
    const response = await api.get(`${CHAT_BASE_URL}/channels/${channelId}`);
    return response.data;
  },

  // Update channel settings
  updateChannel: async (
    channelId: string, 
    data: { name?: string; topic?: string; isPublic?: boolean; password?: string | null }
  ): Promise<ChatChannel> => {
    const response = await api.patch(`${CHAT_BASE_URL}/channels/${channelId}`, data);
    return response.data;
  },

  // Delete a channel (admin only)
  deleteChannel: async (channelId: string): Promise<void> => {
    await api.delete(`${CHAT_BASE_URL}/channels/${channelId}`);
  },

  // Report a message
  reportMessage: async (messageId: string, reason: string): Promise<void> => {
    await api.post(`${CHAT_BASE_URL}/messages/${messageId}/report`, { reason });
  },

  // Pin a message
  pinMessage: async (messageId: string, channelId: string): Promise<void> => {
    await api.post(`${CHAT_BASE_URL}/messages/${messageId}/pin`, { channelId });
  },

  // Unpin a message
  unpinMessage: async (messageId: string, channelId: string): Promise<void> => {
    await api.delete(`${CHAT_BASE_URL}/messages/${messageId}/pin`, { data: { channelId } });
  },

  // Get pinned messages for a channel
  getPinnedMessages: async (channelId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`${CHAT_BASE_URL}/channels/${channelId}/pinned`);
    return response.data;
  },

  // Delete a message (own or with permission)
  deleteMessage: async (messageId: string, channelId: string): Promise<void> => {
    await api.delete(`${CHAT_BASE_URL}/messages/${messageId}`, { data: { channelId } });
  },

  // Get message history for a user (DM history)
  getDirectMessageHistory: async (userId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`${CHAT_BASE_URL}/direct-messages/${userId}`);
    return response.data;
  },

  // Block a user from messaging you
  blockUser: async (userId: string): Promise<void> => {
    await api.post(`${CHAT_BASE_URL}/block/${userId}`);
  },

  // Unblock a user
  unblockUser: async (userId: string): Promise<void> => {
    await api.post(`${CHAT_BASE_URL}/unblock/${userId}`);
  },

  // Get list of blocked users
  getBlockedUsers: async (): Promise<Array<{ id: string; name: string; avatar?: string }>> => {
    const response = await api.get(`${CHAT_BASE_URL}/blocked`);
    return response.data;
  }
};
