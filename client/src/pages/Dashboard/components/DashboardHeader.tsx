import { memo, useMemo } from 'react';
import { 
  Box, 
  Flex,
  Text, 
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Badge,
  Icon,
  Tooltip,
  Progress,
  IconButton,
  Divider,
  Button,
  useBreakpointValue,
  BoxProps
} from '@chakra-ui/react';
import { 
  FiBell, 
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut
} from 'react-icons/fi';
import { 
  FaCoins, 
  FaGem,
  FaBolt,
  FaLeaf
} from 'react-icons/fa';
import { 
  GiWoodenCrate, 
  GiStoneBlock, 
  GiMetalBar 
} from 'react-icons/gi';
import Resource from '../../../components/layout/Resource';

// Resource component has been moved to the main layout/Header.tsx

// Resource component has been moved to the main layout/Header.tsx

// Move ResourceItem type to a separate types file if used in multiple places
import { IconType } from 'react-icons';

interface ResourceItem {
  icon: IconType;
  value: number;
  label: string;
  color: string;
  key: string;
  isVisible?: (isMobile: boolean) => boolean;
}

// Memoized divider component to prevent recreating on each render
const DividerWithMargin = memo(({ mx = 1 }: { mx?: number }) => (
  <Box h="20px" w="1px" bg="rgba(255, 255, 255, 0.1)" mx={mx} />
));
DividerWithMargin.displayName = 'DividerWithMargin';

const DashboardHeader: React.FC = () => {
  // Theme colors - always dark mode
  const bgColor = 'rgba(23, 25, 35, 0.98)';
  const borderColor = 'rgba(255, 255, 255, 0.1)';
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  
  // Memoize resources data to prevent recreation on every render
  const resources = useMemo(() => [
    { 
      icon: FaCoins, 
      value: 12500, 
      label: 'Arany', 
      color: 'yellow.400',
      key: 'gold',
      isVisible: () => true // Always visible
    },
    { 
      icon: FaGem, 
      value: 245, 
      label: 'Drágakő', 
      color: 'pink.400',
      key: 'gems',
      isVisible: (mobile: boolean) => !mobile
    },
    { 
      icon: GiWoodenCrate, 
      value: 12500, 
      label: 'Fa', 
      color: 'orange.300',
      key: 'wood',
      isVisible: (mobile: boolean) => !mobile
    },
    { 
      icon: GiStoneBlock, 
      value: 8430, 
      label: 'Kő', 
      color: 'gray.300',
      key: 'stone',
      isVisible: (mobile: boolean) => !mobile
    },
    { 
      icon: GiMetalBar, 
      value: 5200, 
      label: 'Vas', 
      color: 'gray.400',
      key: 'iron',
      isVisible: (mobile: boolean) => !mobile
    },
    { 
      icon: FaLeaf, 
      value: 9200, 
      label: 'Élelem', 
      color: 'green.300',
      key: 'food',
      isVisible: (mobile: boolean) => !mobile
    }
  ], []); // Empty dependency array as this never changes

  // Memoize the filtered resources to prevent recalculation on every render
  const visibleResources = useMemo(() => {
    return resources.filter(resource => {
      return !resource.isVisible || resource.isVisible(isMobile);
    });
  }, [resources, isMobile]); // Only recalculate when isMobile changes

  // Játékos adatai
  const playerData = {
    name: 'Háborúskodó',
    level: 24,
    rank: 'Vezér',
    avatar: '/assets/avatars/warrior.png',
    resources: {
      gold: 12500,
      gems: 245,
      wood: 12500,
      stone: 8430,
      iron: 5200,
      food: 9200,
      energy: 85,
      maxEnergy: 100
    },
    alliance: {
      name: 'Sárkányvérűek',
      rank: 'Tábornok'
    }
  };

  return (
    <Box 
      as="header"
      bg={bgColor}
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor={borderColor}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="sticky"
      height={{ base: '60px', md: '70px' }}
      px={{ base: 3, md: 6 }}
      py={2}
      transition="all 0.3s ease"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
    >
      <Flex 
        align="center" 
        justify="space-between"
        maxW="1920px"
        mx="auto"
        height="100%"
        position="relative"
        zIndex={10}
      >
        {/* Left side - Player info */}
        <HStack spacing={4}>
          <HStack 
            spacing={3}
            borderRadius="lg"
            px={3}
            py={1.5}
            bg="rgba(0, 0, 0, 0.3)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
            cursor="pointer"
            transition="all 0.2s"
          >
            <Avatar 
              size="sm" 
              name={playerData.name}
              src={playerData.avatar}
              bg="blue.500"
              color="white"
              border="2px solid"
              borderColor="#4299E1"
              boxShadow="0 0 10px rgba(66, 153, 225, 0.5)"
            />
            <Box>
              <HStack spacing={2} align="center">
                <Text fontWeight="bold" fontSize="sm">{playerData.name}</Text>
                <Badge 
                  colorScheme="blue" 
                  variant="solid"
                  fontSize="2xs"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  textTransform="none"
                >
                  {playerData.rank}
                </Badge>
                <Badge 
                  colorScheme="yellow" 
                  variant="solid"
                  fontSize="2xs"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                >
                  {playerData.level}. szint
                </Badge>
              </HStack>
              <HStack spacing={2} mt={1}>
                <Tooltip label="Arany" hasArrow>
                  <HStack spacing={1}>
                    <Icon as={FaCoins} color="yellow.400" boxSize={3} />
                    <Text fontSize="xs">{playerData.resources.gold.toLocaleString()}</Text>
                  </HStack>
                </Tooltip>
                <Tooltip label="Drágakövek" hasArrow>
                  <HStack spacing={1}>
                    <Icon as={FaGem} color="pink.400" boxSize={3} />
                    <Text fontSize="xs">{playerData.resources.gems.toLocaleString()}</Text>
                  </HStack>
                </Tooltip>
              </HStack>
            </Box>
          </HStack>

          {/* Resources - Memoized to prevent unnecessary re-renders */}
          <ResourceList 
            resources={visibleResources} 
            isMobile={isMobile} 
            ml={4} 
          />
        </HStack>

        {/* Right side - Actions */}
        <HStack spacing={3}>
          {/* Energia sáv */}
          <HStack 
            spacing={3}
            display={{ base: 'none', md: 'flex' }}
            bg="rgba(0, 0, 0, 0.3)"
            px={4}
            py={2}
            borderRadius="lg"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
            transition="all 0.2s"
          >
            <Icon as={FaBolt} color="yellow.400" boxSize={4} />
            <Box width="120px">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" fontWeight="bold" color="yellow.400">Energia</Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {playerData.resources.energy}/{playerData.resources.maxEnergy}
                </Text>
              </HStack>
              <Box position="relative" width="100%">
                <Progress 
                  value={playerData.resources.energy} 
                  max={playerData.resources.maxEnergy}
                  size="sm" 
                  colorScheme="yellow"
                  borderRadius="full"
                  bg="rgba(0, 0, 0, 0.3)"
                  sx={{
                    '& > div': {
                      background: 'linear-gradient(90deg, #ECC94B 0%, #F6E05E 100%)',
                    },
                  }}
                />
              </Box>
            </Box>
          </HStack>

          {/* Értesítések gomb */}
          <Tooltip label="Értesítések" hasArrow>
            <Box position="relative">
              <IconButton
                aria-label="Értesítések"
                icon={<FiBell size={18} />}
                variant="ghost"
                colorScheme="whiteAlpha"
                color="whiteAlpha.800"
                _hover={{ 
                  color: 'white', 
                  bg: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)'
                }}
                _active={{
                  transform: 'translateY(0)'
                }}
                transition="all 0.2s"
                borderRadius="lg"
                size="md"
              />
              <Box
                position="absolute"
                top={2}
                right={2}
                w={4}
                h={4}
                bg="red.500"
                borderRadius="full"
                border="2px solid"
                borderColor="gray.800"
                boxShadow="0 0 5px rgba(255, 0, 0, 0.5)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="2xs" fontWeight="bold" color="white">3</Text>
              </Box>
            </Box>
          </Tooltip>

          {/* Felhasználói menü */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              size="md"
              px={3}
              py={1.5}
              borderRadius="lg"
              colorScheme="whiteAlpha"
              color="whiteAlpha.800"
              _hover={{ 
                bg: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
              _active={{
                bg: 'rgba(255, 255, 255, 0.15)'
              }}
              transition="all 0.2s"
              rightIcon={<FiChevronDown />}
            >
              <HStack spacing={3}>
                <Avatar 
                  size="sm" 
                  name={playerData.name}
                  src={playerData.avatar}
                  bg="blue.500"
                  color="white"
                  border="2px solid"
                  borderColor="blue.400"
                  boxShadow="0 0 10px rgba(66, 153, 225, 0.3)"
                />
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontSize="sm" fontWeight="medium">{playerData.name}</Text>
                  <Text fontSize="xs" color="whiteAlpha.700" mt={-0.5}>
                    {playerData.alliance.name}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg="gray.800"
              border="1px solid"
              borderColor="gray.700"
              boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
              py={2}
              minW="220px"
              borderRadius="lg"
              overflow="hidden"
            >
              <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.700">
                <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.900">{playerData.name}</Text>
                <Text fontSize="xs" color="blue.300">{playerData.alliance.rank}</Text>
              </Box>
              <MenuItem 
                icon={<FiUser size={16} />}
                _hover={{ bg: 'whiteAlpha.100' }}
                _focus={{ bg: 'whiteAlpha.100' }}
                fontSize="sm"
                px={4}
                py={2.5}
              >
                Profilom
              </MenuItem>
              <MenuItem 
                icon={<FiSettings size={16} />}
                _hover={{ bg: 'whiteAlpha.100' }}
                _focus={{ bg: 'whiteAlpha.100' }}
                fontSize="sm"
                px={4}
                py={2.5}
              >
                Beállítások
              </MenuItem>
              <Divider my={1} borderColor="gray.700" />
              <MenuItem 
                icon={<FiLogOut size={16} />}
                _hover={{ bg: 'red.900', color: 'white' }}
                _focus={{ bg: 'red.900', color: 'white' }}
                fontSize="sm"
                px={4}
                py={2.5}
              >
                Kijelentkezés
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

// Export the component as default
// Memoized ResourceList component to prevent unnecessary re-renders
const ResourceList = memo(({ 
  resources, 
  isMobile,
  ...props 
}: { 
  resources: ResourceItem[];
  isMobile: boolean;
} & BoxProps) => (
  <HStack 
    spacing={2} 
    display={{ base: 'none', md: 'flex' }}
    divider={<DividerWithMargin />}
    {...props}
  >
    {resources.map((resource) => (
      <Resource
        key={resource.key}
        icon={resource.icon}
        value={resource.value}
        label={resource.label}
        color={resource.color}
        showLabel={!isMobile}
      />
    ))}
  </HStack>
));
ResourceList.displayName = 'ResourceList';

export default memo(DashboardHeader);
