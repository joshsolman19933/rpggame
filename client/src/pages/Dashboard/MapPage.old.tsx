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
  hoverBg 
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
      <Icon as={TileIcon} boxSize={4} />
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

  // Kezeli a mezőkre kattintást
  const handleTileClick = (tile: MapTile) => {
    if (!tile.isExplored) return;
    
    // Mozgás a kiválasztott mezőre
    moveMutation.mutate({ x: tile.x, y: tile.y });
  };

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
        label: 'Felfedezetlen'
      };
    }

    switch (tile.type) {
      case 'erdo':
        return {
          ...baseStyle,
          bg: 'green.900',
          borderColor: 'green.700',
          hoverBg: 'green.800',
          icon: FaMapMarkedAlt,
          label: 'Erdő'
        };
      case 'hegy':
        return {
          ...baseStyle,
          bg: 'gray.700',
          borderColor: 'gray.500',
          hoverBg: 'gray.600',
          icon: FaMapMarkedAlt,
          label: 'Hegy'
        };
      case 'folyo':
        return {
          ...baseStyle,
          bg: 'blue.900',
          borderColor: 'blue.600',
          hoverBg: 'blue.800',
          icon: FaMapMarkedAlt,
          label: 'Folyó'
        };
      default: // síkság
        return {
          ...baseStyle,
          bg: 'yellow.900',
          borderColor: 'yellow.600',
          hoverBg: 'yellow.800',
          icon: FaMapMarkedAlt,
          label: 'Síkság'
        };
    }
  };

  // Visszaadja a mező stílusát a típusa alapján
  const getTileStyle = (tile: MapTile) => {
    const baseStyle = {
      bg: 'gray.800',
      color: 'white',
      borderColor: 'gray.600',
      hoverBg: 'gray.700',
      icon: FaCompass,
      label: 'Ismeretlen'
  // Nincs adat
  if (!mapData) {
    return (
      <Alert status="warning" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" minH="50vh">
        <AlertIcon as={FaExclamationTriangle} boxSize="40px" mr={0} />
        <Text mt={4} fontSize="lg">Nem sikerült betölteni a térképet</Text>
        <Text fontSize="md" color="gray.300">Kérjük, próbáld újra később</Text>
      </Alert>
    );
  // A térkép mezői - csak akkor dolgozzuk fel, ha van adat
  const tiles = mapData?.tiles || [];
  
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
        <Text fontSize="md" color="gray.300">{(error as Error).message}</Text>
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
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Box position="relative" zIndex="1">
            <Heading 
              size="xl" 
              display="flex" 
              alignItems="center" 
              mb={4}
              color="blue.300"
              textShadow="0 0 10px rgba(66, 153, 225, 0.5)"
              fontWeight="bold"
              letterSpacing="wider"
            >
              <Icon as={FaMapMarkedAlt} color="blue.400" mr={3} boxSize={8} />
              Térkép
            </Heading>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              gap={4} 
              alignItems={{ base: 'flex-start', md: 'center' }}
              flexWrap="wrap"
            >
              <Text color="gray.300" maxW="3xl" fontSize="md">
                Fedezd fel a világot, csatázz ellenfelekkel és gyűjts nyersanyagokat a fejlődéshez.
              </Text>
              <Box 
                bg="rgba(0, 0, 0, 0.4)" 
                p={2} 
                borderRadius="md"
                border="1px solid"
                borderColor="rgba(66, 153, 225, 0.3)"
                display="flex"
                alignItems="center"
                boxShadow="0 0 10px rgba(66, 153, 225, 0.2)"
                _hover={{
                  bg: 'rgba(0, 0, 0, 0.5)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 0 15px rgba(66, 153, 225, 0.3)',
                }}
                transition="all 0.2s ease-in-out"
                display="flex"
                alignItems="center"
              >
                <Icon as={FaCompass} mr={2} />
                <Box as="span" fontFamily="mono">
                  X: {playerPosition.x} | Y: {playerPosition.y}
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>

        <Box 
          bg="rgba(26, 32, 44, 0.9)" 
          p={4} 
          borderRadius="lg"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Box 
            position="relative" 
            zIndex="1"
            overflowX="auto"
            py={4}
          >
            <SimpleGrid 
              columns={tiles[0]?.length || 1} 
              gap={2} 
              minW="max-content"
              width="fit-content"
              mx="auto"
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
                    borderColor={borderColor}
                    hoverBg={hoverBg}
                  />
                );
              })}
            </SimpleGrid>
          </Box>
        </Box>

        <Box 
          mt={6} 
          p={6} 
          bg="rgba(26, 32, 44, 0.9)" 
          borderRadius="lg" 
          border="1px solid" 
          borderColor="rgba(255, 255, 255, 0.1)"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        >
          <Heading size="md" mb={4} color="white">Térkép jelmagyarázat</Heading>
          <Box 
            display="grid" 
            gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} 
            gap={4}
          >
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="green.900" mr={3} borderRadius="sm" border="1px solid" borderColor="green.600" />
              <Text color="gray.200" fontSize="sm">Erdő</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="gray.700" mr={3} borderRadius="sm" border="1px solid" borderColor="gray.400" />
              <Text color="gray.200" fontSize="sm">Hegy</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="blue.900" mr={3} borderRadius="sm" border="1px solid" borderColor="blue.500" />
              <Text color="gray.200" fontSize="sm">Folyó</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="yellow.900" mr={3} borderRadius="sm" border="1px solid" borderColor="yellow.600" />
              <Text color="gray.200" fontSize="sm">Síkság</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="blue.400" mr={3} borderRadius="sm" border="1px solid" borderColor="blue.200" />
              <Text color="gray.200" fontSize="sm">Te vagy itt</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="red.500" mr={3} borderRadius="sm" border="1px solid" borderColor="red.300" />
              <Text color="gray.200" fontSize="sm">Ellenfél</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="yellow.400" mr={3} borderRadius="sm" border="1px solid" borderColor="yellow.200" />
              <Text color="gray.200" fontSize="sm">Nyersanyag</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="gray.900" mr={3} borderRadius="sm" border="1px solid" borderColor="gray.600" />
              <Text color="gray.200" fontSize="sm">Felfedezetlen</Text>
            </Flex>
          </Box>
        </Box>
      </Container>
    </Box>
  );

  
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

  // Mező típusok alapján visszaadja a megfelelő stílusokat
  const getTileStyle = (tile: MapTile) => {
    if (!tile.isExplored) {
      return { 
        bg: 'rgba(30, 30, 30, 0.7)', 
        color: 'gray.600', 
        borderColor: 'rgba(255, 255, 255, 0.05)',
        hoverBg: 'rgba(50, 50, 50, 0.7)',
        icon: FaCompass,
        iconColor: 'rgba(255, 255, 255, 0.2)',
        label: 'Ismeretlen terület',
      };
    }

    switch(tile.type) {
      case 'erdo':
        return { 
          bg: 'rgba(0, 45, 0, 0.7)', 
          color: 'green.200', 
          borderColor: 'rgba(0, 100, 0, 0.5)',
          hoverBg: 'rgba(0, 60, 0, 0.7)',
          icon: FaMapMarkedAlt,
          iconColor: 'rgba(72, 187, 120, 0.7)',
          label: 'Erdő',
        };
      case 'hegy':
        return { 
          bg: 'rgba(50, 50, 50, 0.7)', 
          color: 'gray.200', 
          borderColor: 'rgba(100, 100, 100, 0.5)',
          hoverBg: 'rgba(70, 70, 70, 0.7)',
          icon: FaSearchLocation,
          iconColor: 'rgba(200, 200, 200, 0.7)',
          label: 'Hegy',
        };
      case 'folyo':
        return { 
          bg: 'rgba(0, 30, 60, 0.7)', 
          color: 'blue.200', 
          borderColor: 'rgba(0, 100, 200, 0.5)',
          hoverBg: 'rgba(0, 50, 90, 0.7)',
          icon: FaCompass,
          iconColor: 'rgba(100, 180, 255, 0.7)',
          label: 'Folyó',
        };
      default: // síkság
        return { 
          bg: 'rgba(60, 50, 0, 0.7)', 
          color: 'yellow.200', 
          borderColor: 'rgba(150, 120, 0, 0.5)',
          hoverBg: 'rgba(80, 70, 0, 0.7)',
          icon: FaMapMarkedAlt,
          iconColor: 'rgba(255, 220, 100, 0.7)',
          label: 'Síkság',
        };
    }
  };

  const handleTileClick = (tile: MapTile) => {
    if (!mapData) return;
    
    // Ha a játékos a saját mezőjére kattint, nem csinálunk semmit
    if (tile.x === mapData.playerPosition.x && tile.y === mapData.playerPosition.y) {
      return;
    }
    
    // Ha a mező nincs felfedezve, akkor megpróbáljuk felfedezni
    if (!tile.isExplored) {
      exploreMutation.mutate({ x: tile.x, y: tile.y });
      return;
    }
    
    // Ha a mezőn ellenség van, akkor csatát kezdeményezünk
    if (tile.hasEnemy) {
      toast({
        title: 'Ellenséges terület',
        description: 'Ez a terület ellenséges erők ellenőrzése alatt áll!',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Ha a mező szabad, akkor oda mozgatjuk a játékost
    moveMutation.mutate({ x: tile.x, y: tile.y });
  };

  // State management and effects
  
  // Render loading state
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="blue.400" />
      </Flex>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" minH="50vh">
        <AlertIcon boxSize="40px" mr={0} />
        <Text mt={4} fontSize="lg">Hiba történt a térkép betöltése közben</Text>
        <Text fontSize="md" color="gray.300">{(error as Error).message}</Text>
      </Alert>
    );
  }

  // Render no data state
  if (!mapData) {
    return (
      <Alert status="warning" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" minH="50vh">
        <AlertIcon as={FaExclamationTriangle} boxSize="40px" mr={0} />
        <Text mt={4} fontSize="lg">Nem sikerült betölteni a térképet</Text>
        <Text fontSize="md" color="gray.300">Kérjük, próbáld újra később</Text>
      </Alert>
    );
  }

  // Main render
  return (
    <Box p={{ base: 4, md: 6 }}>
      <Container maxW="container.xl" p={0}>
        <Box 
          mb={6}
          bg="rgba(26, 32, 44, 0.9)"
          p={6}
          borderRadius="lg"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Box position="relative" zIndex="1">
            <Heading 
              size="xl" 
              display="flex" 
              alignItems="center" 
              mb={4}
              color="blue.300"
              textShadow="0 0 10px rgba(66, 153, 225, 0.5)"
              fontWeight="bold"
              letterSpacing="wider"
            >
              <Icon as={FaMapMarkedAlt} color="blue.400" mr={3} boxSize={8} />
              Térkép
            </Heading>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              gap={4} 
              alignItems={{ base: 'flex-start', md: 'center' }}
              flexWrap="wrap"
            >
              <Text color="gray.300" maxW="3xl" fontSize="md">
                Fedezd fel a világot, csatázz ellenfelekkel és gyűjts nyersanyagokat a fejlődéshez.
              </Text>
              <Box 
                bg="rgba(0, 0, 0, 0.4)" 
                px={4} 
                py={2}
                borderRadius="lg"
                border="1px solid"
                borderColor="blue.500"
                color="blue.100"
                fontSize="sm"
                fontWeight="medium"
                whiteSpace="nowrap"
                boxShadow="0 0 10px rgba(66, 153, 225, 0.2)"
                _hover={{
                  bg: 'rgba(0, 0, 0, 0.5)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 0 15px rgba(66, 153, 225, 0.3)',
                }}
                transition="all 0.2s ease-in-out"
                display="flex"
                alignItems="center"
              >
                <Icon as={FaCompass} mr={2} />
                <Box as="span" fontFamily="mono">
                  X: {playerPosition.x} | Y: {playerPosition.y}
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>

        <Box 
          bg="rgba(26, 32, 44, 0.9)" 
          p={4} 
          borderRadius="lg"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(66, 153, 225, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Box 
            position="relative"
            zIndex="1"
            overflowX="auto" 
            p={4}
            bg="rgba(0, 0, 0, 0.2)" 
            borderRadius="lg"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            boxShadow="inset 0 0 20px rgba(0, 0, 0, 0.3)"
            sx={{
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                },
              },
            }}
          >
            <Box 
              display="inline-grid" 
              gridTemplateColumns={`repeat(${tiles[0]?.length || 10}, 1fr)`} 
              gap={2}
              minWidth="max-content"
            >
              {tiles.flat().map((tile) => {
                const { bg, color, borderColor, icon: TileIcon, label, hoverBg } = getTileStyle(tile);
                const isPlayerHere = tile.x === playerPosition.x && tile.y === playerPosition.y;
                const isAdjacent = Math.abs(tile.x - playerPosition.x) <= 1 && 
                                 Math.abs(tile.y - playerPosition.y) <= 1 &&
                                 !isPlayerHere;
                
                return (
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
                      cursor: tile.isExplored ? 'pointer' : 'not-allowed',
                      borderColor: tile.isExplored 
                        ? isPlayerHere 
                          ? 'rgba(100, 200, 255, 0.9)' 
                          : 'rgba(66, 153, 225, 0.6)'
                        : borderColor,
                      transition: 'all 0.2s ease-in-out, transform 0.15s ease-out',
                    }}
                    transition="all 0.2s ease-in-out"
                    onClick={() => tile.isExplored && handleTileClick(tile)}
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
                      <Icon as={TileIcon} boxSize={4} />
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
              })}
          </Box>
        </Box>

        <Box 
          mt={6} 
          p={6} 
          bg="rgba(26, 32, 44, 0.9)" 
          borderRadius="lg" 
          border="1px solid" 
          borderColor="rgba(255, 255, 255, 0.1)"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        >
          <Heading size="md" mb={4} color="white">Térkép jelmagyarázat</Heading>
          <Box 
            display="grid" 
            gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} 
            gap={4}
          >
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="green.900" mr={3} borderRadius="sm" border="1px solid" borderColor="green.600" />
              <Text color="gray.200" fontSize="sm">Erdő</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="gray.700" mr={3} borderRadius="sm" border="1px solid" borderColor="gray.400" />
              <Text color="gray.200" fontSize="sm">Hegy</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="blue.900" mr={3} borderRadius="sm" border="1px solid" borderColor="blue.500" />
              <Text color="gray.200" fontSize="sm">Folyó</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="yellow.900" mr={3} borderRadius="sm" border="1px solid" borderColor="yellow.600" />
              <Text color="gray.200" fontSize="sm">Síkság</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="blue.400" mr={3} borderRadius="sm" border="1px solid" borderColor="blue.200" />
              <Text color="gray.200" fontSize="sm">Te vagy itt</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="red.500" mr={3} borderRadius="sm" border="1px solid" borderColor="red.300" />
              <Text color="gray.200" fontSize="sm">Ellenfél</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="yellow.400" mr={3} borderRadius="sm" border="1px solid" borderColor="yellow.200" />
              <Text color="gray.200" fontSize="sm">Nyersanyag</Text>
            </Flex>
            <Flex align="center" bg="rgba(255, 255, 255, 0.05)" p={2} borderRadius="md">
              <Box w={4} h={4} bg="gray.900" mr={3} borderRadius="sm" border="1px solid" borderColor="gray.600" />
              <Text color="gray.200" fontSize="sm">Felfedezetlen</Text>
            </Flex>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MapPage;
