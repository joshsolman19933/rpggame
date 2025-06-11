import { 
  Box, 
  VStack, 
  Button, 
  Icon, 
  Text, 
  Divider,
  Tooltip,
  useBreakpointValue
} from '@chakra-ui/react';
import { 
  FaHome, 
  FaBuilding, 
  FaFlask, 
  FaMap, 
  FaUsers, 
  FaEnvelope, 
  FaStore,
  FaCog
} from 'react-icons/fa';
import { GiSwordman } from 'react-icons/gi';
import { useLocation } from 'react-router-dom';

const menuItems = [
  { icon: FaHome, label: 'Városközpont', path: '/dashboard' },
  { icon: FaBuilding, label: 'Épületek', path: '/dashboard/buildings' },
  { icon: GiSwordman, label: 'Katonaság', path: '/dashboard/military' },
  { icon: FaFlask, label: 'Kutatások', path: '/dashboard/research' },
  { icon: FaMap, label: 'Térkép', path: '/dashboard/map' },
  { icon: FaUsers, label: 'Klán', path: '/dashboard/clan' },
  { icon: FaEnvelope, label: 'Üzenetek', path: '/dashboard/messages' },
  { icon: FaStore, label: 'Piactér', path: '/dashboard/market' },
];

const NavigationMenu: React.FC = () => {
  const location = useLocation();
  const isWide = useBreakpointValue({ base: false, lg: true });
  
  // Dark theme colors
  const bgColor = 'gray.800';
  const borderColor = 'gray.700';
  const activeBg = 'rgba(49, 130, 206, 0.16)';
  const activeColor = 'blue.300';
  const hoverBg = 'rgba(255, 255, 255, 0.08)';
  const iconColor = 'gray.300';
  const activeIconColor = 'blue.300';

  return (
    <Box 
      as="nav"
      w={{ base: '60px', lg: '220px' }} 
      bg={bgColor}
      borderRightWidth="1px"
      borderRightStyle="solid"
      borderRightColor={borderColor}
      p={2}
      transition="all 0.3s ease"
      overflowX="hidden"
      height="100%"
      position="relative"
      display="flex"
      flexDirection="column"
      zIndex={1}
      boxShadow="sm"
    >
      <VStack spacing={1} align="stretch" flex="1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip 
              key={item.path} 
              label={item.label} 
              placement="right"
              hasArrow
              isDisabled={isWide}
            >
              <Button
                as="a"
                href={item.path}
                variant="ghost"
                size="md"
                justifyContent={{ base: 'center', lg: 'flex-start' }}
                leftIcon={
                  <Icon 
                    as={item.icon} 
                    color={isActive ? activeIconColor : iconColor}
                    fontSize="lg"
                  />
                }
                bg={isActive ? activeBg : 'transparent'}
                color={isActive ? activeColor : 'inherit'}
                _hover={{
                  bg: isActive ? activeBg : hoverBg,
                  transform: 'translateX(2px)'
                }}
                _active={{
                  bg: activeBg,
                  color: activeColor,
                }}
                px={3}
                py={3}
                borderRadius="md"
                textAlign="left"
                whiteSpace="nowrap"
                overflow="hidden"
                transition="all 0.2s"
                fontWeight={isActive ? 'semibold' : 'normal'}
              >
                <Text 
                  display={{ base: 'none', lg: 'block' }}
                  fontSize="sm"
                  ml={2}
                >
                  {item.label}
                </Text>
              </Button>
            </Tooltip>
          );
        })}
        
        <Box mt="auto">
          <Divider my={2} />
          
          <Tooltip 
            label="Beállítások" 
            placement="right"
            hasArrow
            isDisabled={isWide}
          >
            <Button
              variant="ghost"
              justifyContent={{ base: 'center', lg: 'flex-start' }}
              leftIcon={
                <Icon 
                  as={FaCog} 
                  color={iconColor}
                  fontSize="lg"
                />
              }
              px={3}
              py={3}
              borderRadius="md"
              width="100%"
              _hover={{
                bg: hoverBg,
                transform: 'translateX(2px)'
              }}
              transition="all 0.2s"
            >
              <Text 
                display={{ base: 'none', lg: 'block' }}
                fontSize="sm"
                ml={2}
              >
                Beállítások
              </Text>
            </Button>
          </Tooltip>
        </Box>
      </VStack>
    </Box>
  );
};

export default NavigationMenu;
