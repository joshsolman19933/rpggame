import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { webSocketService } from '../services/websocket';
import { useAuth } from './AuthContext';
import { toast } from '../components/ui/use-toast';

interface GameContextType {
  isConnected: boolean;
  lastEvent: any;
  sendEvent: (event: string, data?: any) => void;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
  isInitialized: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuth();

  // Handle WebSocket connection
  useEffect(() => {
    if (isAuthenticated && token) {
      webSocketService.connect(token);
      setIsInitialized(true);

      const handleConnect = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
      };

      const handleDisconnect = () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
      };

      webSocketService.subscribe('connect', handleConnect);
      webSocketService.subscribe('disconnect', handleDisconnect);

      return () => {
        webSocketService.disconnect();
        webSocketService.off('connect', handleConnect);
        webSocketService.off('disconnect', handleDisconnect);
      };
    }
  }, [isAuthenticated, token]);

  // Handle game events
  useEffect(() => {
    if (!isConnected) return;

    const handleGameEvent = (data: any) => {
      setLastEvent({ type: 'gameEvent', data, timestamp: new Date() });
      
      // Invalidate relevant queries based on event type
      switch (data.type) {
        case 'village:update':
          queryClient.invalidateQueries({ queryKey: ['village', data.villageId] });
          queryClient.invalidateQueries({ queryKey: ['village', data.villageId, 'resources'] });
          queryClient.invalidateQueries({ queryKey: ['village', data.villageId, 'buildings'] });
          break;
        case 'player:update':
          queryClient.invalidateQueries({ queryKey: ['player', 'me'] });
          queryClient.invalidateQueries({ queryKey: ['player', 'me', 'inventory'] });
          queryClient.invalidateQueries({ queryKey: ['player', 'me', 'skills'] });
          break;
        case 'achievement:unlocked':
          queryClient.invalidateQueries({ queryKey: ['player', 'me', 'achievements'] });
          toast({
            title: 'Achievement Unlocked!',
            description: data.achievement.name,
            variant: 'success',
          });
          break;
        // Add more cases as needed
      }
    };

    const unsubscribe = webSocketService.subscribe('gameEvent', handleGameEvent);
    return () => unsubscribe();
  }, [isConnected, queryClient]);

  // Handle notifications
  useEffect(() => {
    if (!isConnected) return;

    const handleNotification = (notification: any) => {
      setLastEvent({ type: 'notification', data: notification, timestamp: new Date() });
      
      // Show toast for important notifications
      if (notification.priority === 'high' || notification.priority === 'critical') {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'error' ? 'destructive' : 'default',
        });
      }
      
      // Invalidate notifications query
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const unsubscribe = webSocketService.subscribe('notification', handleNotification);
    return () => unsubscribe();
  }, [isConnected, queryClient]);

  // Send event wrapper
  const sendEvent = useCallback((event: string, data: any = {}) => {
    webSocketService.send(event, data);
  }, []);

  // Subscribe wrapper
  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    return webSocketService.subscribe(event, callback);
  }, []);

  return (
    <GameContext.Provider value={{
      isConnected,
      lastEvent,
      sendEvent,
      subscribe,
      isInitialized,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Helper hook for subscribing to game events
export const useGameEvent = (event: string, callback: (data: any) => void, deps: any[] = []) => {
  const { subscribe } = useGame();
  
  useEffect(() => {
    const unsubscribe = subscribe(event, callback);
    return () => unsubscribe();
  }, [event, subscribe, ...deps]);
};
