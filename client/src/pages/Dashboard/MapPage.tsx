import React, { useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  useToast, 
  Flex, 
  Icon, 
  Spinner, 
  Alert, 
  AlertIcon, 
  Tooltip,
  SimpleGrid
} from '@chakra-ui/react';
import { FaMapMarkedAlt, FaSearchLocation, FaCompass, FaExclamationTriangle } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mapService } from '../../services/mapService';
import type { MapData, MapTile } from '../../types/map';

interface TileProps {
  tile: MapTile;
  isPlayerHere: boolean;
  isAdjacent: boolean;
  onTileClick: (tile: MapTile) => void;
  TileIcon: React.ElementType;
  label: string;
  bg: string;
  borderColor: string;
  hoverBg: string;
  color: string;
}

const MapTile: React.FC<TileProps> = ({ 
  tile, 
  isPlayerHere, 
  isAdjacent, 
  onTileClick, 
  TileIcon, 
  label, 
  bg, 
  borderColor, 
  hoverBg,
  color
}) => (
  <Tooltip 
    key={`${tile.x}-${tile.y}`}
    label={`${label} (${tile.x}, ${tile.y})`} 
    placement="top"
    hasArrow
    bg="gray.800"
    borderRadius="md"
    borderWidth="1px"
    borderColor={
      isPlayerHere 
        ? 'rgba(66, 153, 225, 0.8)' 
        : isAdjacent 
          ? 'rgba(66, 153, 225, 0.4)' 
          : borderColor
    }
    boxShadow={
      isPlayerHere 
        ? '0 0 15px 3px rgba(66, 153, 225, 0.6)' 
        : isAdjacent 
          ? '0 0 10px 1px rgba(66, 153, 225, 0.3)'
          : 'none'
    }
    cursor={tile.isExplored ? 'pointer' : 'not-allowed'}
    opacity={tile.isExplored ? 1 : 0.7}
    _hover={{
      transform: tile.isExplored ? 'scale(1.08)' : 'none',
      zIndex: 1,
      bg: tile.isExplored ? hoverBg : bg,
      boxShadow: tile.isExplored 
        ? isPlayerHere 
          ? '0 0 20px 5px rgba(66, 153, 225, 0.7)' 
          : '0 0 15px 3px rgba(66, 153, 225, 0.4)'
        : 'none',
      borderColor: tile.isExplored 
        ? isPlayerHere 
          ? 'rgba(100, 200, 255, 0.9)' 
          : 'rgba(66, 153, 225, 0.6)'
        : borderColor,
      transition: 'all 0.2s ease-in-out, transform 0.15s ease-out',
    }}
    transition="all 0.2s ease-in-out"
    onClick={() => tile.isExplored && onTileClick(tile)}
    position="relative"
    title={!tile.isExplored ? 'Először felfedezned kell ezt a területet!' : ''}
    overflow="hidden"
    _after={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
      pointerEvents: 'none',
    }}
  >
    <Box p={2}>
      <Icon as={TileIcon} boxSize={4} color={color} />
      {isPlayerHere && (
        <Box 
          position="absolute" 
          bottom={1} 
          right={1} 
          w={2} 
          h={2} 
          bg="blue.400" 
          borderRadius="full"
        />
      )}
      {tile.hasEnemy && tile.isExplored && (
        <Box 
          position="absolute" 
          top={1} 
          right={1} 
          w={2} 
          h={2} 
          bg="red.500" 
          borderRadius="full"
        />
      )}
      {tile.hasResource && tile.isExplored && (
        <Box 
          position="absolute" 
          top={1} 
          left={1} 
          w={2} 
          h={2} 
          bg="yellow.400" 
          borderRadius="full"
        />
      )}
      {!tile.isExplored && (
        <Box 
          position="absolute" 
          top={1} 
          right={1} 
          w={2} 
          h={2} 
          bg="gray.600" 
          borderRadius="full"
        />
      )}
    </Box>
  </Tooltip>
);

const MapPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  // Térkép betöltése
  const { 
    data: mapData, 
    isLoading, 
    error 
  } = useQuery<MapData, Error>({
    queryKey: ['map'],
    queryFn: mapService.fetchMap,
    staleTime: 5 * 60 * 1000, // 5 percig friss
  });

  // Játékos kezdeti pozíciója a térkép betöltésekor
  const playerPosition = mapData?.playerPosition || { x: 0, y: 0 };

  // Mező felfedezése
  const exploreMutation = useMutation({
    mutationFn: ({ x, y }: { x: number; y: number }) => mapService.exploreTile(x, y),
    onSuccess: (data, { x, y }) => {
      if (data.events?.length > 0) {
        data.events.forEach(() => {
          toast({
            title: 'Esemény történt!',
            description: `Felfedeztél valami érdekeset a (${x}, ${y}) koordinátán!`,
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        });
      }
      // Frissítjük a térképet az új adatokkal
      queryClient.invalidateQueries({ queryKey: ['map'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hiba történt',
        description: error.message || 'Nem sikerült felfedezni a mezőt.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });
  
  // Játékos mozgatása
  const moveMutation = useMutation({
    mutationFn: ({ x, y }: { x: number; y: number }) => mapService.movePlayer(x, y),
    onSuccess: () => {
      // Frissítjük a térképet az új pozícióval
      queryClient.invalidateQueries({ queryKey: ['map'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Nem sikerült mozogni',
        description: error.message || 'Nem sikerült a mozgás végrehajtása.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Kezeli a mezőkre kattintást
  const handleTileClick = useCallback((tile: MapTile) => {
    if (!tile.isExplored) return;
    moveMutation.mutate({ x: tile.x, y: tile.y });
  }, [moveMutation]);

  // Visszaadja a mező stílusát a típusa alapján
  const getTileStyle = useCallback((tile: MapTile) => {
    const baseStyle = {
      bg: 'gray.800',
      color: 'white',
      borderColor: 'gray.600',
      hoverBg: 'gray.700',
      icon: FaCompass,
      label: 'Ismeretlen'
    };

    if (!tile.isExplored) {
      return {
        ...baseStyle,
        bg: 'gray.900',
        borderColor: 'gray.800',
        hoverBg: 'gray.800',
        icon: FaSearchLocation,
        label: 'Felfedezetlen',
        color: 'gray.500'
      };
    }

    switch (tile.type) {
      case 'erdo':
        return {
          ...baseStyle,
          bg: 'rgba(0, 45, 0, 0.7)',
          borderColor: 'rgba(0, 100, 0, 0.5)',
          hoverBg: 'rgba(0, 60, 0, 0.7)',
          icon: FaMapMarkedAlt,
          label: 'Erdő',
          color: 'green.200'
        };
      case 'hegy':
        return {
          ...baseStyle,
          bg: 'rgba(50, 50, 50, 0.7)',
          borderColor: 'rgba(100, 100, 100, 0.5)',
          hoverBg: 'rgba(70, 70, 70, 0.7)',
          icon: FaSearchLocation,
          label: 'Hegy',
          color: 'gray.200'
        };
      case 'folyo':
        return {
          ...baseStyle,
          bg: 'rgba(0, 60, 100, 0.7)',
          borderColor: 'rgba(0, 150, 255, 0.5)',
          hoverBg: 'rgba(0, 90, 150, 0.7)',
          icon: FaSearchLocation,
          label: 'Folyó',
          color: 'blue.200'
        };
      case 'mezogazdasagi':
        return {
          ...baseStyle,
          bg: 'rgba(139, 125, 0, 0.7)',
          borderColor: 'rgba(200, 180, 0, 0.5)',
          hoverBg: 'rgba(180, 160, 0, 0.7)',
          icon: FaMapMarkedAlt,
          label: 'Mezőgazdasági terület',
          color: 'yellow.200'
        };
      default:
        return baseStyle;
    }
  }, []);

  // Ha betöltöttük a térképet, akkor felfedezzük a kezdő mezőt
  useEffect(() => {
    if (mapData?.playerPosition) {
      const { x, y } = mapData.playerPosition;
      // Csak akkor hívjuk meg az exploreMutation-t, ha még nem fedeztük fel a mezőt
      const currentRow = mapData.tiles[y];
      if (currentRow) {
        const currentTile = currentRow[x];
        if (currentTile && !currentTile.isExplored) {
          exploreMutation.mutate({ x, y });
        }
      }
    }
  }, [mapData, exploreMutation]);
  
  // Memoizáljuk a mezőket a teljesítmény érdekében
  const tiles = useMemo(() => {
    return mapData?.tiles || [];
  }, [mapData]);

  // Betöltés állapota
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="blue.400" />
      </Flex>
    );
  }

  // Hiba esetén
  if (error) {
    return (
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" minH="50vh">
        <AlertIcon as={FaExclamationTriangle} boxSize="40px" mr={0} />
        <Text mt={4} fontSize="lg">Hiba történt a térkép betöltése közben</Text>
        <Text fontSize="md" color="gray.300">{error.message}</Text>
      </Alert>
    );
  }

  // Nincs adat
  if (!mapData) {
    return (
      <Alert status="info" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" minH="50vh">
        <AlertIcon as={FaExclamationTriangle} boxSize="40px" mr={0} />
        <Text mt={4} fontSize="lg">Nincs elérhető térkép adat</Text>
        <Text fontSize="md" color="gray.300">Kérjük, próbálkozz később</Text>
      </Alert>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Container maxW="container.xl" p={0}>
        <Box 
          mb={6}
          bg="rgba(26, 32, 44, 0.9)"
          p={6}
          borderRadius="lg"
          boxShadow="lg"
          borderWidth="1px"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <Heading size="lg" mb={2} color="white">Térkép</Heading>
          <Text color="gray.300">Fedezd fel a világot és találj kincseket!</Text>
        </Box>

        <Box 
          position="relative"
          bg="rgba(17, 24, 39, 0.8)"
          borderRadius="lg"
          p={4}
          boxShadow="lg"
          borderWidth="1px"
          borderColor="rgba(255, 255, 255, 0.05)"
          overflow="hidden"
        >
          <Box 
            position="relative"
            zIndex="1"
            overflowX="auto" 
            overflowY="auto"
            maxH="70vh"
            p={2}
            sx={{
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              },
            }}
          >
            <Box 
              display="inline-grid" 
              gridTemplateColumns={`repeat(${tiles[0]?.length || 10}, 1fr)`} 
              gap={2}
              minW="fit-content"
            >
              {tiles.flat().map((tile) => {
                const { bg, color, borderColor, icon: TileIcon, label, hoverBg } = getTileStyle(tile);
                const isPlayerHere = tile.x === playerPosition.x && tile.y === playerPosition.y;
                const isAdjacent = Math.abs(tile.x - playerPosition.x) <= 1 && 
                                 Math.abs(tile.y - playerPosition.y) <= 1 &&
                                 !isPlayerHere;

                return (
                  <MapTile
                    key={`${tile.x}-${tile.y}`}
                    tile={tile}
                    isPlayerHere={isPlayerHere}
                    isAdjacent={isAdjacent}
                    onTileClick={handleTileClick}
                    TileIcon={TileIcon}
                    label={label}
                    bg={bg}
                    color={color}
                    borderColor={borderColor}
                    hoverBg={hoverBg}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box 
          mt={6} 
          p={6}
          bg="rgba(26, 32, 44, 0.9)"
          borderRadius="lg"
          boxShadow="lg"
          borderWidth="1px"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <Heading size="md" mb={4} color="white">Térkép jelmagyarázat</Heading>
          <Box 
            display="grid" 
            gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} 
            gap={4}
          >
            <Flex align="center">
              <Box w={6} h={6} bg="gray.900" borderWidth="1px" borderColor="gray.800" mr={2} display="flex" alignItems="center" justifyContent="center" borderRadius="md">
                <Icon as={FaSearchLocation} color="gray.500" />
              </Box>
              <Text color="gray.300">Felfedezetlen</Text>
            </Flex>
            <Flex align="center">
              <Box w={6} h={6} bg="green.900" borderWidth="1px" borderColor="green.700" mr={2} display="flex" alignItems="center" justifyContent="center" borderRadius="md">
                <Icon as={FaMapMarkedAlt} color="green.200" />
              </Box>
              <Text color="gray.300">Erdő</Text>
            </Flex>
            <Flex align="center">
              <Box w={6} h={6} bg="gray.700" borderWidth="1px" borderColor="gray.600" mr={2} display="flex" alignItems="center" justifyContent="center" borderRadius="md">
                <Icon as={FaSearchLocation} color="gray.200" />
              </Box>
              <Text color="gray.300">Hegy</Text>
            </Flex>
            <Flex align="center">
              <Box w={6} h={6} bg="blue.900" borderWidth="1px" borderColor="blue.700" mr={2} display="flex" alignItems="center" justifyContent="center" borderRadius="md">
                <Icon as={FaSearchLocation} color="blue.200" />
              </Box>
              <Text color="gray.300">Folyó</Text>
            </Flex>
          </Box>
          
          <Heading size="sm" mt={6} mb={2} color="white">Jelmagyarázat</Heading>
          <Box display="flex" flexWrap="wrap" gap={4} mt={2}>
            <Flex align="center">
              <Box w={4} h={4} bg="blue.400" borderRadius="full" mr={2}></Box>
              <Text color="gray.300" fontSize="sm">Játékos</Text>
            </Flex>
            <Flex align="center">
              <Box w={4} h={4} bg="red.500" borderRadius="full" mr={2}></Box>
              <Text color="gray.300" fontSize="sm">Ellenfél</Text>
            </Flex>
            <Flex align="center">
              <Box w={4} h={4} bg="yellow.400" borderRadius="full" mr={2}></Box>
              <Text color="gray.300" fontSize="sm">Erőforrás</Text>
            </Flex>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MapPage;
