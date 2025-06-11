import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  useQuery, 
  useQueryClient, 
  useInfiniteQuery, 
  InfiniteData
} from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { useGame } from '../contexts/GameContext';
import { ChatMessage, ChatChannel, ChatTypingUser } from '../types/chat';

type Timeout = ReturnType<typeof setTimeout>;

/**
 * Response type for message pagination
 */
interface MessagePage {
  messages: ChatMessage[];
  hasMore: boolean;
  total: number;
}

/**
 * Hook for handling chat functionality including messages, channels, and typing indicators
 */

// Temporary toast implementation - replace with your actual toast implementation
const useToast = () => ({
  toast: (options: { title: string; description: string; variant?: string }) => {
    console.log(`[${options.variant || 'info'}] ${options.title}: ${options.description}`);
  }
});

// Messages response type is now defined as MessagePage interface below

const TYPING_INDICATOR_DURATION = 5000; // 5 seconds
const MESSAGES_PER_PAGE = 50;

export const useChat = (initialChannelId: string = 'global') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, sendEvent } = useGame();
  
  // State
  const [activeChannel, setActiveChannel] = useState<string>(initialChannelId);
  const [messageDraft, setMessageDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<ChatTypingUser[]>([]);
  const typingTimeoutRef = useRef<Timeout>();
  const lastTypingEventTime = useRef<number>(0);

  // Fetch channels
  const {
    data: channels = [],
    isLoading: isLoadingChannels,
    error: channelsError,
    refetch: refetchChannels,
  } = useQuery<ChatChannel[]>({
    queryKey: ['chat', 'channels'],
    queryFn: () => chatService.getChannels(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Message page type for pagination
  interface MessagePage {
    messages: ChatMessage[];
    hasMore: boolean;
    total: number;
  }

  // Fetch messages with infinite scroll
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useInfiniteQuery<MessagePage>({
    queryKey: ['chat', 'messages', activeChannel],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      return chatService.getMessages(activeChannel, { 
        page: pageParam as number, 
        limit: MESSAGES_PER_PAGE 
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    enabled: !!activeChannel,
    staleTime: 30000, // 30 seconds
  });

  // Flatten messages from all pages
  const messages = useMemo(() => {
    return messagesData?.pages.flatMap(page => page.messages) || [];
  }, [messagesData]);

  // Get unread message counts
  const { data: unreadCounts = {}, refetch: refetchUnreadCounts } = useQuery<Record<string, number>>({
    queryKey: ['chat', 'unread'],
    queryFn: () => chatService.getUnreadCounts(),
    refetchInterval: 30000, // 30 seconds
  });

  // Get current channel info
  const currentChannel = useMemo(() => {
    return channels.find(ch => ch.id === activeChannel) || null;
  }, [channels, activeChannel]);

  // Mark messages as read when channel changes
  useEffect(() => {
    if (!activeChannel || !messages.length) return;
    
    const unreadMessages = messages.filter(m => !m.isRead);
    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages.map(m => m.id));
    }
  }, [activeChannel, messages]);

  // Handle sending a message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeChannel || !content.trim()) return;

    try {
      const messageData = {
        channel: activeChannel,
        content,
        isAction: content.startsWith('/me '),
      };
      
      const message = await chatService.sendMessage(messageData);
      
      // Clear typing indicator
      setIsTyping(false);
      sendEvent('chat:typing', { 
        channel: activeChannel, 
        isTyping: false 
      });
      
      // Optimistically update the UI
      queryClient.setQueryData<InfiniteData<MessagePage>>(
        ['chat', 'messages', activeChannel],
        (oldData) => {
          if (!oldData?.pages?.length) return oldData;
          
          const newPages = [...oldData.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              messages: [message, ...newPages[0].messages],
            };
          }
          
          return { 
            ...oldData, 
            pages: newPages,
            pageParams: oldData.pageParams 
          } as InfiniteData<MessagePage>;
        }
      );
      
      setMessageDraft('');
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült elküldeni az üzenetet',
        variant: 'destructive',
      });
      throw error;
    }
  }, [activeChannel, queryClient, sendEvent, toast]);

  // Handle typing indicator
  const handleTyping = useCallback((isUserTyping: boolean) => {
    if (isUserTyping === isTyping) return;
    
    const now = Date.now();
    // Throttle typing events to avoid spamming
    if (isUserTyping && now - lastTypingEventTime.current < 2000) {
      return;
    }
    
    setIsTyping(isUserTyping);
    lastTypingEventTime.current = now;
    
    if (activeChannel) {
      sendEvent('chat:typing', { 
        channel: activeChannel, 
        isTyping: isUserTyping 
      });
    }
    
    // Auto-reset typing status after a delay
    if (isUserTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (activeChannel) {
          sendEvent('chat:typing', { 
            channel: activeChannel, 
            isTyping: false 
          });
        }
      }, TYPING_INDICATOR_DURATION);
    }
  }, [activeChannel, isTyping, sendEvent]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!messageIds.length) return;
    
    try {
      await chatService.markAsRead(messageIds);
      
      // Optimistically update the UI
      queryClient.setQueryData<ChatMessage[]>(['chat', 'messages', activeChannel], 
        (old = []) => old.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );
      
      // Update unread counts
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread'] });
      
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [activeChannel, queryClient]);

  // Join a channel
  const joinChannel = useCallback(async (channelId: string, password?: string) => {
    try {
      const channel = await chatService.joinChannel(channelId, password);
      await refetchChannels();
      setActiveChannel(channel.id);
      return channel;
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }, [refetchChannels]);

  // Leave a channel
  const leaveChannel = useCallback(async (channelId: string) => {
    try {
      await chatService.leaveChannel(channelId);
      await refetchChannels();
      
      // If leaving the active channel, switch to global
      if (channelId === activeChannel) {
        setActiveChannel('global');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }, [activeChannel, refetchChannels]);

  // Create a new channel
  const createChannel = useCallback(async (data: {
    name: string;
    type: 'public' | 'private' | 'alliance';
    password?: string;
    topic?: string;
  }) => {
    try {
      const channel = await chatService.createChannel(data);
      await refetchChannels();
      setActiveChannel(channel.id);
      return channel;
    } catch (error) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  }, [refetchChannels]);

  // Handle incoming WebSocket events
  useEffect(() => {
    if (!isConnected) return;
    
    const handleNewMessage = (message: ChatMessage) => {
      // Update the messages list if it's for the active channel
      if (message.channel === activeChannel) {
        queryClient.setQueryData<InfiniteData<MessagePage>>(
          ['chat', 'messages', activeChannel],
          (oldData) => {
            if (!oldData?.pages?.length) return oldData;
            
            // Check if message already exists
            const messageExists = oldData.pages.some((page: MessagePage) => 
              page.messages.some((m: ChatMessage) => m.id === message.id)
            );
            
            if (messageExists) return oldData;
            
            // Add the new message to the first page
            const newPages = [...oldData.pages];
            if (newPages[0]) {
              newPages[0] = {
                ...newPages[0],
                messages: [message, ...newPages[0].messages],
              };
            }
            
            return { 
              ...oldData, 
              pages: newPages,
              pageParams: oldData.pageParams 
            } as InfiniteData<MessagePage>;
          }
        );
      }
      
      // Update unread counts
      queryClient.setQueryData<Record<string, number>>(
        ['chat', 'unread'],
        (old = {}) => ({
          ...old,
          [message.channel]: (old[message.channel] || 0) + 1,
        })
      );
      
      // Show notification for private messages or mentions
      if (message.channel !== activeChannel || document.hidden) {
        const isPrivate = message.channel === 'private';
        const isMentioned = message.content.includes('@' + (localStorage.getItem('username') || '').toLowerCase());
        
        if (isPrivate || isMentioned) {
          new Notification(
            isPrivate 
              ? `New message from ${message.senderName}` 
              : `Mention in ${message.channel}`,
            {
              body: message.content.length > 100 
                ? message.content.substring(0, 100) + '...' 
                : message.content,
              icon: message.senderAvatar,
            }
          );
        }
      }
    };
    
    const handleTypingEvent = (data: { 
      userId: string; 
      userName: string; 
      channel: string; 
      isTyping: boolean;
    }) => {
      if (data.channel !== activeChannel) return;
      
      setTypingUsers(prev => {
        // Remove existing typing indicator for this user
        const updated = prev.filter(u => u.id !== data.userId);
        
        // Add new typing indicator if they're typing
        if (data.isTyping) {
          return [
            ...updated,
            { 
              id: data.userId, 
              name: data.userName, 
              until: Date.now() + TYPING_INDICATOR_DURATION,
            },
          ];
        }
        
        return updated;
      });
    };
    
    const handleChannelUpdate = () => {
      refetchChannels();
    };
    
    // Subscribe to WebSocket events
    const unsubscribeMessage = useGame().subscribe('chat:message', handleNewMessage);
    const unsubscribeTyping = useGame().subscribe('chat:typing', handleTypingEvent);
    const unsubscribeChannelUpdate = useGame().subscribe('chat:channel-update', handleChannelUpdate);
    
    // Clean up typing indicators periodically
    const typingCleanup = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => prev.filter(u => u.until > now));
    }, 1000);
    
    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeChannelUpdate();
      clearInterval(typingCleanup);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [activeChannel, isConnected, queryClient, refetchChannels]);
  
  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    // Data
    channels,
    messages,
    activeChannel,
    currentChannel,
    messageDraft,
    typingUsers,
    isTyping,
    unreadCounts,
    hasMoreMessages: hasNextPage,
    
    // Loading states
    isLoading: isLoadingChannels || isLoadingMessages,
    isSending: false, // Managed by mutation
    isFetchingMore: isFetchingNextPage,
    
    // Errors
    error: channelsError || messagesError,
    
    // Actions
    sendMessage,
    setMessageDraft,
    setActiveChannel,
    handleTyping,
    markMessagesAsRead,
    joinChannel,
    leaveChannel,
    createChannel,
    loadMoreMessages,
    refetchChannels,
    refetchMessages,
    refetchUnreadCounts,
  };
};

// Hook to get messages for a specific channel
export const useChatChannel = (channelId: string) => {
  const { data: messages = [], isLoading, error } = useQuery<ChatMessage[]>({
    queryKey: ['chat', 'channel-messages', channelId],
    queryFn: () => chatService.getMessages(channelId, { page: 0, limit: 100 }).then(res => res.messages),
    enabled: !!channelId,
    staleTime: 30000, // 30 seconds
  });
  
  return { messages, isLoading, error };
};