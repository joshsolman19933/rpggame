import { Box, Flex, Heading, Text, VStack, HStack, Icon, Badge, SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaTree, FaMountain, FaCoins, FaBreadSlice, FaInfoCircle } from 'react-icons/fa';
import { BuildingInfo } from './BuildingInfo';
import { VillageBuilding, BuildingType, VillageState } from './types';
import { useState } from 'react';

// Ideiglenes épület típusok ikonjai
const buildingIcons: Record<string, any> = {
  townhall: FaMapMarkerAlt,
  barracks: FaMapMarkerAlt,
  market: FaMapMarkerAlt,
  farm: FaTree,
  mine: FaMountain,
  lumbermill: FaTree,
};

// Ideiglenes épület színsémák
const buildingColors: Record<string, string> = {
  townhall: 'yellow',
  barracks: 'red',
  market: 'green',
  farm: 'green',
  mine: 'gray',
  lumbermill: 'orange',
};

// Kezdeti falu állapota
const initialVillageState: VillageState = {
  level: 1,
  experience: 0,
  population: 10,
  maxPopulation: 50,
  resources: {
    wood: 1000,
    stone: 800,
    gold: 2000,
    food: 1500,
  },
  buildings: [
    {
      id: 'townhall',
      type: 'townhall',
      name: 'Városháza',
      level: 1,
      maxLevel: 20,
      description: 'A falud központja. Itt irányíthatod a települést és fejlesztheted az épületeket.',
      upgradeCost: { wood: 100, stone: 80, gold: 200 },
      position: { gridColumn: '2 / 3', gridRow: '2 / 3' },
      constructionTime: 60,
      isUnderConstruction: false,
    },
    {
      id: 'barracks',
      type: 'barracks',
      name: 'Laktanya',
      level: 1,
      maxLevel: 15,
      description: 'Itt kiképezheted a harcosokat és fejlesztheted a hadseregedet.',
      upgradeCost: { wood: 80, stone: 100, gold: 150 },
      position: { gridColumn: '4 / 5', gridRow: '2 / 3' },
      constructionTime: 120,
      isUnderConstruction: false,
    },
    {
      id: 'market',
      type: 'market',
      name: 'Piac',
      level: 1,
      maxLevel: 10,
      description: 'Kereskedj más játékosokkal és fejleszd a gazdaságodat.',
      upgradeCost: { wood: 50, stone: 50, gold: 100 },
      position: { gridColumn: '1 / 2', gridRow: '3 / 4' },
      constructionTime: 90,
      isUnderConstruction: false,
    },
    {
      id: 'farm',
      type: 'farm',
      name: 'Farm',
      level: 1,
      maxLevel: 15,
      description: 'Termelj élelmiszert a lakosságod számára.',
      upgradeCost: { wood: 60, stone: 40, gold: 80, food: 50 },
      position: { gridColumn: '3 / 4', gridRow: '4 / 5' },
      constructionTime: 75,
      isUnderConstruction: false,
    },
    {
      id: 'mine',
      type: 'mine',
      name: 'Bánya',
      level: 1,
      maxLevel: 15,
      description: 'Bányássz nyersanyagokat a fejlődéshez.',
      upgradeCost: { wood: 80, stone: 100, gold: 120 },
      position: { gridColumn: '5 / 6', gridRow: '3 / 4' },
      constructionTime: 150,
      isUnderConstruction: false,
    },
    {
      id: 'lumbermill',
      type: 'lumbermill',
      name: 'Fűrésztelep',
      level: 1,
      maxLevel: 15,
      description: 'Termelj fát az építkezésekhez és fejlesztésekhez.',
      upgradeCost: { wood: 100, stone: 60, gold: 80 },
      position: { gridColumn: '3 / 4', gridRow: '1 / 2' },
      constructionTime: 100,
      isUnderConstruction: false,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export const VillageView = () => {
  const [village, setVillage] = useState<VillageState>(initialVillageState);
  const [selectedBuilding, setSelectedBuilding] = useState<VillageBuilding | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleBuildingClick = (building: VillageBuilding) => {
    setSelectedBuilding(building);
    onOpen();
  };

  const handleUpgrade = (buildingId: string) => {
    setVillage(prevVillage => {
      const updatedBuildings = prevVillage.buildings.map(building => {
        if (building.id === buildingId) {
          return {
            ...building,
            level: building.level + 1,
            isUnderConstruction: true,
            constructionEndTime: new Date(Date.now() + building.constructionTime * 1000).toISOString(),
          };
        }
        return building;
      });

      // Csökkentjük az erőforrásokat
      const building = prevVillage.buildings.find(b => b.id === buildingId);
      if (!building) return prevVillage;

      const newResources = { ...prevVillage.resources };
      Object.entries(building.upgradeCost).forEach(([resource, cost]) => {
        if (resource in newResources) {
          newResources[resource as keyof typeof newResources] -= cost;
        }
      });

      return {
        ...prevVillage,
        buildings: updatedBuildings,
        resources: newResources,
      };
    });
  };

  const renderResource = (icon: any, value: number, color: string, label: string) => (
    <HStack spacing={2} bg="gray.700" px={3} py={2} borderRadius="md" minW="120px">
      <Icon as={icon} color={color} />
      <VStack spacing={0} align="flex-start">
        <Text fontSize="sm" color="gray.400">{label}</Text>
        <Text fontWeight="bold">{value.toLocaleString()}</Text>
      </VStack>
    </HStack>
  );

  return (
    <Box p={4}>
      {/* Fejléc */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="flex-start" spacing={1}>
          <Heading size="xl" color="white">Falum</Heading>
          <HStack spacing={2}>
            <Badge colorScheme="blue" fontSize="sm" px={2} py={0.5} borderRadius="full">
              {village.level}. szint
            </Badge>
            <Text fontSize="sm" color="gray.400">
              Lakosság: {village.population}/{village.maxPopulation}
            </Text>
          </HStack>
        </VStack>
        
        <HStack spacing={4}>
          {renderResource(FaTree, village.resources.wood, 'green.400', 'Fa')}
          {renderResource(FaMountain, village.resources.stone, 'gray.400', 'Kő')}
          {renderResource(FaCoins, village.resources.gold, 'yellow.400', 'Arany')}
          {renderResource(FaBreadSlice, village.resources.food, 'orange.400', 'Élelem')}
        </HStack>
      </Flex>

      {/* Épületek rács */}
      <Box 
        bgImage="url('/images/village-bg.jpg')" 
        bgSize="cover" 
        bgPosition="center"
        borderRadius="xl" 
        p={6}
        minH="60vh"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 'xl',
          zIndex: 1,
        }}
      >
        <Box 
          display="grid"
          gridTemplateColumns="repeat(5, 1fr)"
          gridTemplateRows="repeat(5, 1fr)"
          gap={4}
          h="100%"
          minH="50vh"
          position="relative"
          zIndex={2}
        >
          {/* Épületek megjelenítése */}
          {village.buildings.map((building) => {
            const IconComponent = buildingIcons[building.type] || FaMapMarkerAlt;
            const colorScheme = buildingColors[building.type] || 'gray';
            
            return (
              <Box
                key={building.id}
                gridColumn={building.position.gridColumn}
                gridRow={building.position.gridRow}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                onClick={() => handleBuildingClick(building)}
                _hover={{
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s',
                }}
                position="relative"
              >
                <Box
                  p={4}
                  bg={`${colorScheme}.800`}
                  borderRadius="xl"
                  border="2px"
                  borderColor={`${colorScheme}.500`}
                  textAlign="center"
                  minW="120px"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bg: 'rgba(0,0,0,0.3)',
                    zIndex: 1,
                  }}
                >
                  <Box position="relative" zIndex={2}>
                    <Icon as={IconComponent} w={8} h={8} mb={2} color={`${colorScheme}.300`} />
                    <Text fontWeight="bold" color="white">{building.name}</Text>
                    <Badge colorScheme={colorScheme} mt={1}>
                      {building.level}. szint
                    </Badge>
                    {building.isUnderConstruction && (
                      <Badge colorScheme="yellow" ml={2}>
                        Épül
                      </Badge>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Rácsvonalak */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Box
              key={`v-${i}`}
              position="absolute"
              top={0}
              bottom={0}
              left={`${(i * 20)}%`}
              w="1px"
              bg="whiteAlpha.200"
              zIndex={1}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <Box
              key={`h-${i}`}
              position="absolute"
              left={0}
              right={0}
              top={`${(i * 20)}%`}
              h="1px"
              bg="whiteAlpha.200"
              zIndex={1}
            />
          ))}
        </Box>
      </Box>

      {/* Épület részletek modális ablak */}
      {selectedBuilding && (
        <BuildingInfo
          isOpen={isOpen}
          onClose={onClose}
          building={selectedBuilding}
          onUpgrade={handleUpgrade}
        />
      )}
    </Box>
  );
};

export default VillageView;
