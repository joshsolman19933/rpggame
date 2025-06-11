import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  Icon,
  HStack,
  Badge,
  Progress,
} from '@chakra-ui/react';
import { FaFlask } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ResearchCard from './ResearchCard';
import { Research, ResearchData } from '../../types/research';
import { fetchResearches, startResearch, cancelResearch, completeResearch } from '../../services/researchService';

interface ResearchViewProps {
  villageLevel: number;
  buildingLevels: Record<string, number>;
  resources: {
    wood: number;
    stone: number;
    iron: number;
    gold: number;
    food: number;
  };
  onResearchCompleted?: (researchId: string) => void;
}

const ResearchView: React.FC<ResearchViewProps> = ({
  villageLevel,
  buildingLevels,
  resources,
  onResearchCompleted
}) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [researchInProgress, setResearchInProgress] = useState<string | null>(null);

  // Fetch researches
  const { data: researchData, isLoading, error } = useQuery<ResearchData, Error>({
    queryKey: ['researches'],
    queryFn: fetchResearches,
    // Add any options you need here
  });

  // Get available researches from the data
  const availableResearches = researchData?.availableResearches || [];

  // Filter researches by category
  const getResearchesByCategory = (category: string): Research[] => {
    return availableResearches.filter((research: Research) => research.category === category);
  };

  // Check if a research is in progress
  useEffect(() => {
    const currentResearch = availableResearches.find((r: Research) => r.isResearching);
    setResearchInProgress(currentResearch?.id || null);
  }, [availableResearches]);

  // Start research mutation
  const startResearchMutation = useMutation({
    mutationFn: (researchId: string) => startResearch(researchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researches'] });
      toast({
        title: 'Kutatás elindítva',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      console.error('Hiba a kutatás indításakor:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült elindítani a kutatást.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  // Cancel research mutation
  const cancelResearchMutation = useMutation({
    mutationFn: (researchId: string) => cancelResearch(researchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researches'] });
      toast({
        title: 'Kutatás megszakítva',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      console.error('Hiba a kutatás megszakításakor:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült megszakítani a kutatást.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  // Complete research mutation
  const completeResearchMutation = useMutation({
    mutationFn: (researchId: string) => completeResearch(researchId),
    onSuccess: (data: any, researchId: string) => {
      queryClient.invalidateQueries({ queryKey: ['researches'] });
      
      // Show success message with rewards if any
      toast({
        title: 'Kutatás kész!',
        description: data.rewards?.message || 'Sikeresen befejezted a kutatást!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Show effects if any
      if (data.rewards?.effects?.length > 0) {
        data.rewards.effects.forEach((effect: string, index: number) => {
          setTimeout(() => {
            toast({
              title: 'Új hatás',
              description: effect,
              status: 'info',
              duration: 4000,
              isClosable: true,
            });
          }, 1000 * (index + 1));
        });
      }
      
      // Notify parent component
      if (onResearchCompleted) {
        onResearchCompleted(researchId);
      }
    },
    onError: (error: Error) => {
      console.error('Hiba a kutatás befejezésekor:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült befejezni a kutatást.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Handle research start
  const handleStartResearch = async (researchId: string) => {
    try {
      await startResearchMutation.mutateAsync(researchId);
    } catch (error) {
      console.error('Error starting research:', error);
    }
  };

  // Handle research cancellation
  const handleCancelResearch = async (researchId: string) => {
    try {
      await cancelResearchMutation.mutateAsync(researchId);
    } catch (error) {
      console.error('Error canceling research:', error);
    }
  };

  // Handle research completion
  const handleCompleteResearch = async (researchId: string) => {
    try {
      await completeResearchMutation.mutateAsync(researchId);
    } catch (error) {
      console.error('Error completing research:', error);
    }
  };

  // Check if player has required buildings for a research
  const hasRequiredBuildings = (research: Research) => {
    if (!research.requiredBuildings) return true;
    return research.requiredBuildings.every(
      (req: { buildingId: string; level: number }) => (buildingLevels[req.buildingId] || 0) >= req.level
    );
  };

  // Check if player can afford a research
  const canAffordResearch = (research: Research) => {
    const cost = research.cost || { wood: 0, stone: 0, iron: 0, gold: 0, food: 0 };
    return (
      resources.wood >= (cost.wood || 0) &&
      resources.stone >= (cost.stone || 0) &&
      resources.iron >= (cost.iron || 0) &&
      resources.gold >= (cost.gold || 0) &&
      resources.food >= (cost.food || 0)
    );
  };

  // Get category name
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'economy': return 'Gazdaság';
      case 'military': return 'Katonaság';
      case 'defense': return 'Védelem';
      case 'infrastructure': return 'Infrastruktúra';
      case 'magic': return 'Mágia';
      default: return category;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'economy': return '💰';
      case 'military': return '⚔️';
      case 'defense': return '🛡️';
      case 'infrastructure': return '🏗️';
      case 'magic': return '🔮';
      default: return '🔍';
    }
  };

  // Get research progress
  const getResearchProgress = (research: Research) => {
    if (!research.isResearching || !research.researchEndsAt) return null;
    
    const endTime = new Date(research.researchEndsAt).getTime();
    const now = new Date().getTime();
    const totalTime = research.researchTime * 1000;
    const timeLeft = Math.max(0, endTime - now);
    const progress = Math.max(0, 100 - (timeLeft / totalTime * 100));
    
    return {
      progress,
      timeLeft: Math.ceil(timeLeft / 1000)
    };
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Kutatások betöltése...</Text>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.400">Hiba történt a kutatások betöltésekor.</Text>
        <Button mt={4} onClick={() => queryClient.invalidateQueries({ queryKey: ['researches'] })}>
          Újrapróbálkozás
        </Button>
      </Box>
    );
  }

  // Show empty state
  if (!availableResearches || availableResearches.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Jelenleg nincs elérhető kutatás.</Text>
      </Box>
    );
  }

  // Get all unique categories
  const categories = Array.from(new Set(availableResearches.map((r: Research) => r.category)));

  return (
    <Box>
      <Tabs 
        variant="enclosed" 
        colorScheme="blue" 
        isLazy 
        index={activeTab}
        onChange={(index) => setActiveTab(index)}
      >
        <TabList overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
          <Tab key="all">Összes</Tab>
          {categories.map(category => (
            <Tab key={category}>
              <HStack spacing={2}>
                <Text>{getCategoryIcon(category)}</Text>
                <Text>{getCategoryName(category)}</Text>
                <Badge 
                  colorScheme={category === 'economy' ? 'green' : 
                              category === 'military' ? 'red' : 
                              category === 'defense' ? 'blue' :
                              category === 'infrastructure' ? 'purple' : 'pink'}
                  variant="solid"
                  borderRadius="full"
                  fontSize="0.6em"
                  px={2}
                >
                  {availableResearches.filter((r: Research) => r.category === category).length}
                </Badge>
              </HStack>
            </Tab>
          ))}
        </TabList>

        <TabPanels mt={4}>
          {/* All Researches */}
          <TabPanel p={0}>
            <Grid 
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} 
              gap={6}
            >
              {availableResearches.map(research => {
                const hasBuildings = hasRequiredBuildings(research);
                const canAfford = canAffordResearch(research);
                const isInProgress = researchInProgress === research.id;
                
                return (
                  <ResearchCard
                    key={research.id}
                    research={research}
                    villageLevel={villageLevel}
                    onStartResearch={handleStartResearch}
                    onCancelResearch={handleCancelResearch}
                    onCompleteResearch={handleCompleteResearch}
                    hasRequiredBuildings={hasBuildings}
                    canAfford={canAfford}
                    isResearchInProgress={isInProgress}
                  />
                );
              })}
            </Grid>
          </TabPanel>

          {/* Researches by Category */}
          {categories.map(category => (
            <TabPanel key={category} p={0}>
              <Grid 
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} 
                gap={6}
              >
                {getResearchesByCategory(category).map(research => {
                  const hasBuildings = hasRequiredBuildings(research);
                  const canAfford = canAffordResearch(research);
                  const isInProgress = researchInProgress === research.id;
                  
                  return (
                    <ResearchCard
                      key={research.id}
                      research={research}
                      villageLevel={villageLevel}
                      onStartResearch={handleStartResearch}
                      onCancelResearch={handleCancelResearch}
                      onCompleteResearch={handleCompleteResearch}
                      hasRequiredBuildings={hasBuildings}
                      canAfford={canAfford}
                      isResearchInProgress={isInProgress}
                    />
                  );
                })}
              </Grid>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      {/* Current Research Progress */}
      {researchInProgress && availableResearches && (
        <Box 
          position="fixed" 
          bottom={0} 
          left={0} 
          right={0} 
          bg="rgba(26, 32, 44, 0.95)" 
          p={4}
          borderTopWidth="1px"
          borderColor="whiteAlpha.200"
          zIndex="docked"
        >
          <Box maxW="1200px" mx="auto">
            <Heading size="md" mb={2} display="flex" alignItems="center">
              <Icon as={FaFlask} color="blue.400" mr={2} />
              Aktív kutatás
            </Heading>
            
            {availableResearches
              .filter(r => r.isResearching)
              .map(research => {
                const progress = getResearchProgress(research);
                
                return (
                  <Box key={research.id}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontWeight="bold">{research.name}</Text>
                      <Text>
                        {progress ? formatTime(progress.timeLeft) : 'Befejezés...'}
                      </Text>
                    </Flex>
                    {progress && (
                      <Progress 
                        value={progress.progress} 
                        size="sm" 
                        colorScheme="blue" 
                        borderRadius="full"
                      />
                    )}
                  </Box>
                );
              })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Helper function to format time
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  return [h, m > 9 ? m : h ? '0' + m : m || '0', s < 10 ? '0' + s : s]
    .filter(Boolean)
    .join(':');
};

export default ResearchView;
