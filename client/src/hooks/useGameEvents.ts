import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameAPI } from '../services/api';
import { GameEvent, Notification } from '../types/game';
import { useEffect, useCallback } from 'react';

export const useGameEvents = () => {
  const queryClient = useQueryClient();

  // Get game events
  const {
    data: events = [],
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery<GameEvent[]>({
    queryKey: ['gameEvents'],
    queryFn: () => gameAPI.getEvents().then(res => res.data),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });

  // Get unread notifications
  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => gameAPI.getUnreadNotifications().then(res => res.data),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark notification as read
  const { mutate: markAsRead } = useMutation({
    mutationFn: (notificationId: string) => 
      gameAPI.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    notifications.forEach(notification => {
      if (!notification.isRead) {
        markAsRead(notification.id as string);
      }
    });
  }, [notifications, markAsRead]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get events by type
  const getEventsByType = (type?: string) => {
    return type 
      ? events.filter(event => event.type === type)
      : events;
  };

  // Get notifications by type
  const getNotificationsByType = (type?: string) => {
    return type 
      ? notifications.filter(notification => notification.type === type)
      : notifications;
  };

  // Subscribe to real-time updates (placeholder for WebSocket implementation)
  useEffect(() => {
    // In a real app, this would set up a WebSocket connection
    // For now, we'll just refetch data periodically
    const interval = setInterval(() => {
      refetchEvents();
      refetchNotifications();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [refetchEvents, refetchNotifications]);

  return {
    // Data
    events,
    notifications,
    unreadCount,
    
    // Loading states
    isLoading: isLoadingEvents || isLoadingNotifications,
    
    // Errors
    error: eventsError || notificationsError,
    
    // Actions
    markAsRead,
    markAllAsRead,
    getEventsByType,
    getNotificationsByType,
    refetchEvents,
    refetchNotifications,
  };
};

// Hook to get leaderboard data
export const useLeaderboard = (type: 'players' | 'villages' | 'alliances' = 'players', limit: number = 10) => {
  const {
    data: leaderboard,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leaderboard', type, limit],
    queryFn: () => gameAPI.getLeaderboard(type, limit).then(res => res.data),
    staleTime: 300000, // 5 minutes
  });

  return {
    leaderboard,
    isLoading,
    error,
    refetch,
  };
};
