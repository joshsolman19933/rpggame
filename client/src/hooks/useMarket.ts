import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketAPI } from '../services/api';
import { ResourceType } from '../types/game';
import { toast } from '../components/ui/use-toast';
import { useGame } from '../contexts/GameContext';
import { useEffect } from 'react';

export interface MarketOffer {
  id: string;
  sellerId: string;
  sellerName: string;
  offerResource: ResourceType;
  offerAmount: number;
  requestResource: ResourceType;
  requestAmount: number;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'expired' | 'canceled';
}

export interface MarketTradeHistory {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  offerResource: ResourceType;
  offerAmount: number;
  requestResource: ResourceType;
  requestAmount: number;
  tradedAt: string;
  marketFee: number;
}

export const useMarket = (villageId: string) => {
  const queryClient = useQueryClient();
  const { isConnected } = useGame();
  
  // Get all active market offers
  const {
    data: offers = [],
    isLoading: isLoadingOffers,
    error: offersError,
    refetch: refetchOffers,
  } = useQuery<MarketOffer[]>({
    queryKey: ['market', 'offers'],
    queryFn: () => marketAPI.getOffers().then(res => res.data),
    staleTime: 60000, // 1 minute
    refetchInterval: isConnected ? false : 300000, // 5 minutes if not using WebSocket
  });

  // Get player's active offers
  const {
    data: myOffers = [],
    isLoading: isLoadingMyOffers,
    error: myOffersError,
    refetch: refetchMyOffers,
  } = useQuery<MarketOffer[]>({
    queryKey: ['market', 'my-offers'],
    queryFn: () => marketAPI.getMyOffers().then(res => res.data),
    enabled: !!villageId,
  });

  // Get trade history
  const {
    data: tradeHistory = [],
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery<MarketTradeHistory[]>({
    queryKey: ['market', 'history'],
    queryFn: () => marketAPI.getTradeHistory().then(res => res.data),
    enabled: !!villageId,
  });

  // Get market rates (exchange rates between resources)
  const {
    data: marketRates = {},
    isLoading: isLoadingRates,
    error: ratesError,
    refetch: refetchRates,
  } = useQuery<Record<string, number>>({
    queryKey: ['market', 'rates'],
    queryFn: () => marketAPI.getMarketRates().then(res => res.data),
    staleTime: 300000, // 5 minutes
  });

  // Create a new market offer
  const { mutate: createOffer, isPending: isCreatingOffer } = useMutation({
    mutationFn: (data: {
      offerResource: ResourceType;
      offerAmount: number;
      requestResource: ResourceType;
      requestAmount: number;
      expiresInHours?: number;
    }) => marketAPI.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'offers'] });
      queryClient.invalidateQueries({ queryKey: ['market', 'my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
      
      toast({
        title: 'Offer Created',
        description: 'Your market offer has been created successfully.',
      });
    },
  });

  // Accept a market offer
  const { mutate: acceptOffer, isPending: isAcceptingOffer } = useMutation({
    mutationFn: (offerId: string) => marketAPI.acceptOffer(offerId),
    onSuccess: (_, offerId) => {
      queryClient.invalidateQueries({ queryKey: ['market', 'offers'] });
      queryClient.invalidateQueries({ queryKey: ['market', 'my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['market', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
      
      const acceptedOffer = offers.find(o => o.id === offerId);
      if (acceptedOffer) {
        toast({
          title: 'Trade Completed',
          description: `You have successfully traded with ${acceptedOffer.sellerName}.`,
        });
      }
    },
  });

  // Cancel a market offer
  const { mutate: cancelOffer, isPending: isCancelingOffer } = useMutation({
    mutationFn: (offerId: string) => marketAPI.cancelOffer(offerId),
    onSuccess: (_, offerId) => {
      queryClient.invalidateQueries({ queryKey: ['market', 'offers'] });
      queryClient.invalidateQueries({ queryKey: ['market', 'my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
      
      toast({
        title: 'Offer Canceled',
        description: 'Your market offer has been canceled.',
      });
    },
  });

  // Calculate exchange rate between two resources
  const getExchangeRate = (from: ResourceType, to: ResourceType): number => {
    if (from === to) return 1;
    
    const rateKey = `${from}_${to}`;
    return marketRates[rateKey] || 1;
  };

  // Calculate fair trade value based on market rates
  const calculateFairTrade = (
    offerResource: ResourceType, 
    requestResource: ResourceType, 
    offerAmount: number
  ): number => {
    if (offerResource === requestResource) return offerAmount;
    
    const rate = getExchangeRate(offerResource, requestResource);
    return Math.round(offerAmount * rate * 100) / 100; // Round to 2 decimal places
  };

  // Filter offers by resource type
  const filterOffers = (criteria: {
    offerResource?: ResourceType;
    requestResource?: ResourceType;
    minRatio?: number;
    maxRatio?: number;
    sellerId?: string;
  }) => {
    return offers.filter(offer => {
      if (criteria.offerResource && offer.offerResource !== criteria.offerResource) return false;
      if (criteria.requestResource && offer.requestResource !== criteria.requestResource) return false;
      if (criteria.sellerId && offer.sellerId !== criteria.sellerId) return false;
      
      // Calculate the ratio (offerAmount / requestAmount)
      const ratio = offer.offerAmount / offer.requestAmount;
      
      if (criteria.minRatio !== undefined && ratio < criteria.minRatio) return false;
      if (criteria.maxRatio !== undefined && ratio > criteria.maxRatio) return false;
      
      return true;
    });
  };

  // Get best offers for a specific resource pair
  const getBestOffers = (offerResource: ResourceType, requestResource: ResourceType, limit: number = 5) => {
    return offers
      .filter(offer => 
        offer.offerResource === offerResource && 
        offer.requestResource === requestResource
      )
      .sort((a, b) => {
        // Sort by best ratio (highest offerAmount/requestAmount)
        const ratioA = a.offerAmount / a.requestAmount;
        const ratioB = b.offerAmount / b.requestAmount;
        return ratioB - ratioA;
      })
      .slice(0, limit);
  };

  // Subscribe to market updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribe = useGame().subscribe('market:update', () => {
      queryClient.invalidateQueries({ queryKey: ['market', 'offers'] });
      queryClient.invalidateQueries({ queryKey: ['market', 'my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['market', 'history'] });
    });
    
    return () => unsubscribe();
  }, [isConnected, queryClient]);

  return {
    // Data
    offers,
    myOffers,
    tradeHistory,
    marketRates,
    
    // Loading states
    isLoading: isLoadingOffers || isLoadingMyOffers || isLoadingHistory || isLoadingRates,
    isCreatingOffer,
    isAcceptingOffer,
    isCancelingOffer,
    
    // Errors
    error: offersError || myOffersError || historyError || ratesError,
    
    // Actions
    createOffer,
    acceptOffer,
    cancelOffer,
    refetchOffers,
    refetchMyOffers,
    refetchHistory,
    refetchRates,
    
    // Utilities
    getExchangeRate,
    calculateFairTrade,
    filterOffers,
    getBestOffers,
  };
};

// Hook to get a specific market offer
export const useMarketOffer = (offerId: string) => {
  const { offers, ...rest } = useMarket(''); // Empty villageId since we're not using it here
  const offer = offers.find(o => o.id === offerId);
  
  return {
    offer,
    ...rest,
  };
};
