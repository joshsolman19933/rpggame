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
  Icon,
  IconButton,
  Button,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  VStack,
  useColorMode,
  MenuDivider,
  Link as ChakraLink,
  Heading
} from '@chakra-ui/react';
import { IconType } from 'react-icons';
import Resource from './Resource';
import { 
  FiBell, 
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMoon,
  FiSun,
  FiHome,
  FiBook,
  FiUserPlus,
  FiLogIn
} from 'react-icons/fi';
import { 
  FaCoins, 
  FaGem, 
  FaLeaf,
  FaShieldAlt,
  FaBuilding,
  FaFistRaised
} from 'react-icons/fa'; // Using FaFistRaised as an alternative to FaSwords
import { 
  GiWoodenCrate, 
  GiStoneBlock, 
  GiMetalBar,
  GiSwordman
} from 'react-icons/gi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Default player data - in a real app, this would come from a context or API
const DEFAULT_PLAYER_DATA = {
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
    maxEnergy: 100,
    attack: 1245,
    defense: 876
  },
  alliance: {
    name: 'Sárkányvérűek',
    rank: 'Tábornok',
    members: 42
  },
  notifications: 3
};

// Type for resource items in the header
type ResourceItem = {
  icon: IconType; // Using IconType from react-icons
  value: number;
  label: string;
  color: string;
  key: string;
  isVisible?: (isMobile: boolean, isTablet: boolean) => boolean;
};



const Header = () => {
  // Hooks must be called unconditionally at the top level
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const isTablet = useBreakpointValue({ base: false, lg: true }) || false;
  const headerBg = useColorModeValue('whiteAlpha.900', 'rgba(23, 25, 35, 0.98)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure();
  
  // In a real app, this would come from a context or API
  const playerData = DEFAULT_PLAYER_DATA;
  
  // Memoize resources to prevent unnecessary re-renders
  const resources = useMemo<ResourceItem[]>(
    () => [
      { 
        icon: FaCoins, 
        value: playerData.resources.gold, 
        label: 'Arany', 
        color: 'yellow.400',
        key: 'gold',
        isVisible: (mobile: boolean, tablet: boolean) => tablet || !mobile
      },
      { 
        icon: FaGem, 
        value: playerData.resources.gems, 
        label: 'Drágakő', 
        color: 'pink.400',
        key: 'gems',
        isVisible: (mobile) => !mobile
      },
      { 
        icon: GiWoodenCrate, 
        value: playerData.resources.wood, 
        label: 'Fa', 
        color: 'orange.300',
        key: 'wood',
        isVisible: (mobile) => !mobile
      },
      { 
        icon: GiStoneBlock, 
        value: playerData.resources.stone, 
        label: 'Kő', 
        color: 'gray.300',
        key: 'stone',
        isVisible: (mobile) => !mobile
      },
      { 
        icon: GiMetalBar, 
        value: playerData.resources.iron, 
        label: 'Vas', 
        color: 'gray.400',
        key: 'iron',
        isVisible: (mobile) => !mobile
      },
      { 
        icon: FaLeaf, 
        value: playerData.resources.food, 
        label: 'Élelem', 
        color: 'green.300',
        key: 'food',
        isVisible: (mobile) => !mobile
      },
      { 
        icon: FaFistRaised, 
        value: playerData.resources.attack, 
        label: 'Támadás', 
        color: 'red.400',
        key: 'attack',
        isVisible: (_, tablet) => tablet
      },
      { 
        icon: FaShieldAlt, 
        value: playerData.resources.defense, 
        label: 'Védelem', 
        color: 'blue.400',
        key: 'defense',
        isVisible: (_, tablet) => tablet
      },
    ],
    [playerData] // Removed isTablet from deps as it's not used directly in the memoized value
  );

  // Filter visible resources based on screen size
  const visibleResources = useMemo(() => {
    return resources.filter((resource: ResourceItem) => {
      if (!resource.isVisible) return true;
      try {
        return resource.isVisible(!!isMobile, !!isTablet);
      } catch (error) {
        console.error('Error in resource visibility check:', error);
        return false;
      }
    });
  }, [resources, isMobile, isTablet]);



  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box 
      as="header"
      bg={headerBg}
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor={borderColor}
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex="sticky"
      height={{ base: '60px', md: '70px' }}
      px={{ base: 3, md: 4, lg: 6 }}
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
        {/* Left side - Logo */}
        <HStack spacing={4}>
          <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <HStack spacing={2}>
              <Icon as={GiSwordman} boxSize={8} color="brand.300" />
              <Heading size="md" color="brand.300">
                Birodalmi Kalandok
              </Heading>
            </HStack>
          </ChakraLink>
        </HStack>

        {/* Middle - Navigation (only for desktop) */}
        <HStack 
          spacing={6} 
          display={{ base: 'none', md: 'flex' }}
          mx={8}
          flex={1}
          justify="center"
        >
          {isAuthenticated ? (
            <>
              <ChakraLink as={RouterLink} to="/dashboard" color="whiteAlpha.800" _hover={{ color: 'white' }}>
                <HStack spacing={2}>
                  <Icon as={FiHome} />
                  <Text>Irányítópult</Text>
                </HStack>
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/village" color="whiteAlpha.800" _hover={{ color: 'white' }}>
                <HStack spacing={2}>
                  <Icon as={FaBuilding} />
                  <Text>Falu</Text>
                </HStack>
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/research" color="whiteAlpha.800" _hover={{ color: 'white' }}>
                <HStack spacing={2}>
                  <Icon as={FiBook} />
                  <Text>Kutatás</Text>
                </HStack>
              </ChakraLink>
            </>
          ) : (
            <>
              <ChakraLink as={RouterLink} to="/" color="whiteAlpha.800" _hover={{ color: 'white' }}>
                Főoldal
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/docs" color="whiteAlpha.800" _hover={{ color: 'white' }}>
                Dokumentáció
              </ChakraLink>
            </>
          )}
        </HStack>

        {/* Right side - Auth/User menu */}
        <HStack spacing={3}>
          {/* Color mode toggle */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            color="current"
            _hover={{ bg: 'whiteAlpha.200' }}
          />

          {/* Resources */}
          {visibleResources.map((resource) => {
            const IconComponent = resource.icon;
            return (
              <Resource
                key={resource.key}
                icon={IconComponent}
                value={resource.value}
                label={resource.label}
                color={resource.color}
                showLabel={false}
              />
            );
          })}

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <IconButton
                aria-label="Értesítések"
                icon={
                  <>
                    <FiBell />
                    {playerData.notifications > 0 && (
                      <Box
                        as="span"
                        position="absolute"
                        top={1}
                        right={1}
                        w={4}
                        h={4}
                        bg="red.500"
                        borderRadius="full"
                        fontSize="xs"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {playerData.notifications > 9 ? '9+' : playerData.notifications}
                      </Box>
                    )}
                  </>
                }
                variant="ghost"
                position="relative"
                onClick={() => {}}
              />

              {/* User menu */}
              <Menu isOpen={isMenuOpen} onOpen={onMenuOpen} onClose={onMenuClose}>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  px={2}
                  py={1}
                  rounded="full"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  _active={{ bg: 'whiteAlpha.300' }}
                  rightIcon={<FiChevronDown />}
                >
                  <HStack spacing={3}>
                    <Avatar 
                      size="sm" 
                      name={user?.username || 'Felhasználó'}
                      src={user?.avatar}
                      bg="brand.400"
                      color="white"
                      border="2px solid"
                      borderColor="brand.300"
                    />
                    {!isMobile && (
                      <VStack spacing={0} align="flex-start">
                        <Text fontSize="sm" fontWeight="medium" lineHeight="shorter">
                          {user?.username || 'Felhasználó'}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.600" lineHeight="shorter">
                          {playerData.alliance.name}
                        </Text>
                      </VStack>
                    )}
                  </HStack>
                </MenuButton>
                <MenuList 
                  bg={useColorModeValue('white', 'gray.800')}
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  zIndex="dropdown"
                >
                  <Box px={4} py={2} borderBottomWidth="1px" borderColor="inherit">
                    <Text fontWeight="bold">{user?.username || 'Felhasználó'}</Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      {playerData.alliance.rank}
                    </Text>
                  </Box>
                  <MenuItem 
                    as={RouterLink} 
                    to="/profile" 
                    icon={<FiUser />}
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                  >
                    Profilom
                  </MenuItem>
                  <MenuItem 
                    as={RouterLink} 
                    to="/settings" 
                    icon={<FiSettings />}
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                  >
                    Beállítások
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem 
                    icon={<FiLogOut />}
                    color={useColorModeValue('red.500', 'red.400')}
                    _hover={{ 
                      bg: useColorModeValue('red.50', 'red.900'),
                      color: useColorModeValue('red.600', 'red.300')
                    }}
                    onClick={handleLogout}
                  >
                    Kijelentkezés
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <HStack spacing={2}>
              <Button 
                as={RouterLink} 
                to="/login" 
                leftIcon={<FiLogIn />}
                variant="outline"
                size={isMobile ? 'sm' : 'md'}
              >
                Bejelentkezés
              </Button>
              <Button 
                as={RouterLink} 
                to="/register" 
                leftIcon={<FiUserPlus />}
                colorScheme="brand"
                size={isMobile ? 'sm' : 'md'}
              >
                Regisztráció
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>

      {/* Mobile resources bar */}
      {isAuthenticated && isMobile && (
        <Box 
          position="fixed" 
          bottom={0} 
          left={0} 
          right={0} 
          bg={useColorModeValue('white', 'gray.800')}
          borderTop="1px solid"
          borderColor={borderColor}
          px={4}
          py={2}
          zIndex="sticky"
          display={{ base: 'block', md: 'none' }}
        >
          <HStack spacing={2} overflowX="auto" py={1}>
            {visibleResources.map((resource) => {
              const { key, ...rest } = resource;
              return <Resource key={key} {...rest} showLabel={false} />;
            })}
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default memo(Header);