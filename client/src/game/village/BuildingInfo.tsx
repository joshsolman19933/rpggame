import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Icon,
  Progress,
  Tooltip,
  useDisclosure,
  ModalFooter,
  Box,
  useToast,
} from '@chakra-ui/react';
import { FaCoins, FaTree, FaMountain, FaBreadSlice, FaHammer, FaClock } from 'react-icons/fa';
import { VillageBuilding, ResourceCost } from './types';

interface BuildingInfoProps {
  isOpen: boolean;
  onClose: () => void;
  building: VillageBuilding;
  onUpgrade: (buildingId: string) => void;
}

export const BuildingInfo: React.FC<BuildingInfoProps> = ({
  isOpen,
  onClose,
  building,
  onUpgrade,
}) => {
  const toast = useToast();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  const handleUpgrade = () => {
    if (building.isUnderConstruction) {
      toast({
        title: 'Építés folyamatban',
        description: 'Ez az épület jelenleg épül, kérj várj a fejlesztéssel!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    onConfirmOpen();
  };

  const confirmUpgrade = () => {
    onUpgrade(building.id);
    onConfirmClose();
    onClose();
    
    toast({
      title: 'Fejlesztés elindítva',
      description: `A(z) ${building.name} fejlesztése elindult.`, 
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} másodperc`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} perc`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} óra`;
    return `${Math.floor(seconds / 86400)} nap`;
  };

  const renderResourceCost = (cost: ResourceCost) => (
    <VStack align="stretch" spacing={2} mt={4}>
      <Text fontWeight="bold" fontSize="sm" color="gray.400">
        Fejlesztési költségek:
      </Text>
      {Object.entries(cost).map(([resource, amount]) => (
        <HStack key={resource} spacing={2}>
          <Icon
            as={
              resource === 'wood'
                ? FaTree
                : resource === 'stone'
                ? FaMountain
                : resource === 'gold'
                ? FaCoins
                : FaBreadSlice
            }
            color={
              resource === 'wood'
                ? 'green.400'
                : resource === 'stone'
                ? 'gray.400'
                : resource === 'gold'
                ? 'yellow.400'
                : 'orange.400'
            }
          />
          <Text>
            {resource === 'wood'
              ? 'Fa:'
              : resource === 'stone'
              ? 'Kő:'
              : resource === 'gold'
              ? 'Arany:'
              : 'Élelem:'}{' '}
            <Text as="span" fontWeight="bold">
              {amount.toLocaleString()}
            </Text>
          </Text>
        </HStack>
      ))}
      <HStack mt={2}>
        <Icon as={FaClock} color="gray.400" />
        <Text>Idő: {formatTime(building.constructionTime)}</Text>
      </HStack>
    </VStack>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white" border="1px" borderColor="whiteAlpha.300">
          <ModalHeader>
            <HStack>
              <Text>{building.name}</Text>
              <Badge colorScheme="blue" fontSize="md">{building.level}. szint</Badge>
              {building.isUnderConstruction && (
                <Badge colorScheme="yellow" fontSize="md">Építés alatt</Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text>{building.description}</Text>
              
              {building.isUnderConstruction && building.constructionEndTime && (
                <Box>
                  <Text mb={2} fontWeight="medium">Építési folyamat:</Text>
                  <Progress 
                    value={70} // Ezt dinamikusan kell kiszámolni a jelenlegi idő és a befejezési idő alapján
                    size="sm" 
                    colorScheme="blue" 
                    borderRadius="full" 
                    mb={2}
                  />
                  <Text fontSize="sm" color="gray.400">
                    Hátralévő idő: {formatTime(3600)} {/* Ezt is dinamikusan kellene számolni */}
                  </Text>
                </Box>
              )}
              
              <Divider borderColor="whiteAlpha.200" />
              
              <Box>
                <Text fontWeight="medium">Jelenlegi szint: {building.level}</Text>
                <Text fontSize="sm" color="gray.400">
                  Következő szint: {building.level + 1}
                  {building.level === building.maxLevel && ' (max szint elérve)'}
                </Text>
              </Box>
              
              {building.level < building.maxLevel ? (
                <>
                  <Divider borderColor="whiteAlpha.200" />
                  <Text fontWeight="medium">Következő szint előnyei:</Text>
                  <VStack align="stretch" spacing={2} pl={4}>
                    {/* Itt jönnének a következő szint előnyei */}
                    <HStack>
                      <Box w="6px" h="6px" borderRadius="full" bg="brand.300" mt={1.5} flexShrink={0} />
                      <Text>+10% termelési sebesség</Text>
                    </HStack>
                    <HStack>
                      <Box w="6px" h="6px" borderRadius="full" bg="brand.300" mt={1.5} flexShrink={0} />
                      <Text>+5 maximális kapacitás</Text>
                    </HStack>
                  </VStack>
                  
                  {renderResourceCost(building.upgradeCost)}
                </>
              ) : (
                <Box bg="whiteAlpha.100" p={3} borderRadius="md">
                  <Text textAlign="center" fontWeight="medium">
                    Elérted az épület maximális szintjét!
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={4} w="full" justify="space-between">
              <Button variant="outline" onClick={onClose}>
                Bezárás
              </Button>
              
              {building.level < building.maxLevel && (
                <Tooltip 
                  label={building.isUnderConstruction ? 'Várj, amíg az építés befejeződik!' : ''}
                  isDisabled={!building.isUnderConstruction}
                >
                  <Button
                    colorScheme="blue"
                    leftIcon={<FaHammer />}
                    onClick={handleUpgrade}
                    isDisabled={building.isUnderConstruction}
                  >
                    Fejlesztés
                  </Button>
                </Tooltip>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Megerősítő modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white" border="1px" borderColor="whiteAlpha.300">
          <ModalHeader>Megerősítés szükséges</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Biztosan szeretnéd fejleszteni a(z) {building.name} épületet?</Text>
            <Text mt={2} fontSize="sm" color="gray.400">
              Ez a művelet nem vonható vissza.
            </Text>
            {renderResourceCost(building.upgradeCost)}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={4} w="full" justify="space-between">
              <Button variant="outline" onClick={onConfirmClose}>
                Mégse
              </Button>
              <Button colorScheme="green" onClick={confirmUpgrade}>
                Megerősítem
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
