import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Icon,
  Progress,
  Text,
  Tooltip,
  VStack,
  Badge,
  useDisclosure,
  Collapse,
  useToast
} from '@chakra-ui/react';
import { FaFlask, FaClock, FaLock, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { Research } from '../../types/research';

interface ResearchCardProps {
  research: Research;
  villageLevel: number;
  onStartResearch: (researchId: string) => Promise<void>;
  onCancelResearch: (researchId: string) => Promise<void>;
  onCompleteResearch: (researchId: string) => Promise<void>;
  hasRequiredBuildings: boolean;
  canAfford: boolean;
  isResearchInProgress: boolean;
}

const ResearchCard: React.FC<ResearchCardProps> = ({
  research,
  villageLevel,
  onStartResearch,
  onCancelResearch,
  onCompleteResearch,
  hasRequiredBuildings,
  canAfford,
  isResearchInProgress
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const toast = useToast();

  // Calculate time left for research
  useEffect(() => {
    if (!research.researchEndsAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const endTime = new Date(research.researchEndsAt!).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(diff > 0 ? diff : 0);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [research.researchEndsAt]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    return [h, m > 9 ? m : h ? '0' + m : m || '0', s < 10 ? '0' + s : s]
      .filter(Boolean)
      .join(':');
  };

  // Get category color
  const getCategoryColor = () => {
    switch (research.category) {
      case 'economy': return 'green';
      case 'military': return 'red';
      case 'defense': return 'blue';
      case 'infrastructure': return 'purple';
      case 'magic': return 'pink';
      default: return 'gray';
    }
  };

  // Handle research start
  const handleStartResearch = async () => {
    if (isLoading || !canAfford || !hasRequiredBuildings) return;
    
    try {
      setIsLoading(true);
      await onStartResearch(research.id);
      
      toast({
        title: 'Kutatás elindítva',
        description: `${research.name} kutatása elkezdődött.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Hiba a kutatás indításakor:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült elindítani a kutatást.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle research cancellation
  const handleCancelResearch = async () => {
    try {
      setIsLoading(true);
      await onCancelResearch(research.id);
      
      toast({
        title: 'Kutatás megszakítva',
        description: `${research.name} kutatása megszakítva.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Hiba a kutatás megszakításakor:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült megszakítani a kutatást.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle research completion
  const handleCompleteResearch = async () => {
    try {
      setIsLoading(true);
      await onCompleteResearch(research.id);
      
      toast({
        title: 'Kutatás kész!',
        description: `${research.name} kutatása befejeződött!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Hiba a kutatás befejezésekor:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült befejezni a kutatást.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if research can be completed
  const canBeCompleted = timeLeft === 0 && research.isResearching;
  const isLocked = villageLevel < research.requiredVillageLevel;

  return (
    <Card 
      variant="outline"
      borderColor="whiteAlpha.200"
      bg="rgba(26, 32, 44, 0.9)"
      _hover={{ transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      opacity={isLocked ? 0.6 : 1}
    >
      <CardHeader p={4} pb={2}>
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Box
              w="50px"
              h="50px"
              bg={`${getCategoryColor()}.700`}
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="2px solid"
              borderColor={`${getCategoryColor()}.500`}
              fontSize="xl"
            >
              {research.icon || <Icon as={FaFlask} />}
            </Box>
            <Box>
              <HStack spacing={2} align="center">
                <Heading size="md" color={isLocked ? 'gray.500' : 'white'}>
                  {research.name} {research.level > 0 && `(${research.level})`}
                </Heading>
                {research.isResearched && (
                  <Badge colorScheme="green" variant="solid" fontSize="xs">
                    Kész
                  </Badge>
                )}
                {research.isResearching && (
                  <Badge colorScheme="blue" variant="outline" fontSize="xs">
                    Folyamatban
                  </Badge>
                )}
              </HStack>
              <Text fontSize="sm" color="gray.400">
                {research.category === 'economy' ? 'Gazdaság' : 
                 research.category === 'military' ? 'Katonaság' :
                 research.category === 'defense' ? 'Védelem' :
                 research.category === 'infrastructure' ? 'Infrastruktúra' : 'Mágia'}
                {research.requiredVillageLevel > 0 && ` • ${research.requiredVillageLevel}. szint`}
              </Text>
            </Box>
          </HStack>
        </Flex>
      </CardHeader>

      <CardBody p={4} pt={2}>
        <Text fontSize="sm" color="gray.300" mb={3}>
          {research.description}
        </Text>

        {/* Research progress */}
        {research.isResearching && timeLeft !== null && (
          <Box mb={4}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs">Hátralévő idő:</Text>
              <Text fontSize="xs" fontWeight="bold">
                {formatTime(timeLeft)}
              </Text>
            </Flex>
            <Progress 
              value={timeLeft ? 100 - (timeLeft / research.researchTime * 100) : 100} 
              size="sm" 
              colorScheme={getCategoryColor()} 
              borderRadius="full" 
            />
          </Box>
        )}

        {/* Effects */}
        {research.effects.length > 0 && (
          <Box mb={4}>
            <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
              Hatások:
            </Text>
            <VStack align="stretch" spacing={1}>
              {research.effects.map((effect, idx) => (
                <HStack key={idx} spacing={2} fontSize="sm">
                  <Icon as={FaInfoCircle} color={`${getCategoryColor()}.400`} />
                  <Text color="gray.300">{effect.description}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        {/* Toggle details */}
        <Button
          size="sm"
          variant="outline"
          colorScheme={getCategoryColor()}
          onClick={onToggle}
          width="100%"
          rightIcon={
            <Icon 
              as={FaInfoCircle} 
              transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'} 
              transition="transform 0.2s"
            />
          }
        >
          Részletek
        </Button>

        <Collapse in={isOpen} animateOpacity>
          <Box mt={3} pt={3} borderTopWidth="1px" borderColor="whiteAlpha.100">
            {/* Cost */}
            <Box mb={3}>
              <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                Költség:
              </Text>
              <VStack align="stretch" spacing={1}>
                {Object.entries(research.cost).map(([resource, amount]) => (
                  amount > 0 && (
                    <HStack key={resource} justify="space-between" fontSize="sm">
                      <HStack spacing={2}>
                        <Text color="gray.400">
                          {resource === 'wood' ? 'Fa' :
                           resource === 'stone' ? 'Kő' :
                           resource === 'iron' ? 'Vas' :
                           resource === 'gold' ? 'Arany' : 'Élelem'}
                          :
                        </Text>
                      </HStack>
                      <Text color={canAfford ? 'white' : 'red.400'}>
                        {amount.toLocaleString('hu-HU')}
                      </Text>
                    </HStack>
                  )
                ))}
                <HStack justify="space-between" fontSize="sm">
                  <Text color="gray.400">Idő:</Text>
                  <Text>{Math.floor(research.researchTime / 60)} perc</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Requirements */}
            {research.requiredBuildings.length > 0 && (
              <Box mb={3}>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                  Szükséges épületek:
                </Text>
                <VStack align="stretch" spacing={1}>
                  {research.requiredBuildings.map((req, idx) => (
                    <HStack key={idx} justify="space-between" fontSize="sm">
                      <Text color={hasRequiredBuildings ? 'white' : 'red.400'}>
                        {req.buildingId} ({req.level}. szint)
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Prerequisites */}
            {research.prerequisites.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
                  Előfeltételek:
                </Text>
                <VStack align="stretch" spacing={1}>
                  {research.prerequisites.map((prereq, idx) => (
                    <HStack key={idx} justify="space-between" fontSize="sm">
                      <Text color="gray.400">
                        {prereq.buildingId ? 
                          `${prereq.buildingId} (${prereq.buildingLevel}. szint)` :
                          prereq.researchId ?
                          `${prereq.researchId} kutatás` :
                          `${prereq.villageLevel}. szintű falu`
                        }
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardBody>

      <CardFooter pt={0} px={4} pb={4}>
        {research.isResearched ? (
          <Button 
            size="sm" 
            colorScheme="green" 
            variant="outline" 
            width="100%" 
            isDisabled
            leftIcon={<FaCheck />}
          >
            Kutatva
          </Button>
        ) : research.isResearching ? (
          <>
            {canBeCompleted ? (
              <Button 
                size="sm" 
                colorScheme="green" 
                width="100%" 
                onClick={handleCompleteResearch}
                isLoading={isLoading}
                leftIcon={<FaCheck />}
              >
                Befejezés
              </Button>
            ) : (
              <Button 
                size="sm" 
                colorScheme="red" 
                variant="outline" 
                width="100%" 
                onClick={handleCancelResearch}
                isLoading={isLoading}
              >
                Megszakítás
              </Button>
            )}
          </>
        ) : (
          <Button 
            size="sm" 
            colorScheme={getCategoryColor()}
            width="100%" 
            onClick={handleStartResearch}
            isDisabled={isLocked || !canAfford || !hasRequiredBuildings || isResearchInProgress || isLoading}
            isLoading={isLoading}
            leftIcon={<FaFlask />}
          >
            {isLocked ? `Szükséges falu szint: ${research.requiredVillageLevel}` :
             !hasRequiredBuildings ? 'Hiányzó épület' :
             !canAfford ? 'Nincs elég nyersanyag' :
             isResearchInProgress ? 'Másik kutatás folyamatban' :
             'Kutatás kezdése'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResearchCard;
