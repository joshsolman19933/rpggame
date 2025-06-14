import { useState } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  SimpleGrid, 
  HStack, 
  Icon,
  Badge,
  Progress,
  Tooltip,
  SlideFade,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { 
  FaHome, 
  FaHammer, 
  FaCoins, 
  FaUsers, 
  FaShieldAlt, 
  FaFireAlt, 
  FaMagic,
  FaInfoCircle,
  FaTrophy,
  FaLock,
  FaLeaf,
  FaClock
} from 'react-icons/fa';

// Define types
interface Building {
  id: number;
  name: string;
  level: number;
  icon: IconType;
  color: string;
  description: string;
  progress: number;
  nextLevel: string;
  production: string;
  isUpgrading: boolean;
  timeLeft: string;
  unlocked: boolean;
  locked: boolean;
  cost: {
    wood: number;
    stone: number;
    gold: number;
  };
};

interface BuildingCardProps {
  building: Building;
  onUpgrade: (id: number) => void;
}

// Animation variants for building card - simplified for performance
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: {
    y: -8,
    boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      y: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 15
      },
      boxShadow: { duration: 0.3 }
    }
  },
  tap: {
    scale: 0.96,
    transition: { 
      type: 'spring',
      stiffness: 500,
      damping: 20
    }
  }
};

// Animation variants for particles - simplified to prevent performance issues
const particleVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 0.5, 0],
    y: [0, 50, 100],
    x: [0, 0, 0],
    scale: [0.5, 1, 0.5],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut',
      times: [0, 0.5, 1]
    }
  }
};

// Animation variants for containers
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

// Remove unused AchievementNotification component

// Building card component
const BuildingCard: React.FC<BuildingCardProps> = ({ building, onUpgrade }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  
  const handleUpgrade = () => {
    if (building.isUpgrading || building.locked) return;
    
    // Visual feedback
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 200);
    
    // Check for achievements when upgrading
    if (building.level === 1) {
      console.log('Achievement unlocked: First upgrade!');
    }
    
    // Trigger upgrade
    onUpgrade(building.id);
  };
  
  // Simple particle effect for upgrades - disabled for performance
  const renderParticles = () => null;
  
  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box
      as={motion.div}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap={isTapped ? 'tap' : undefined}
      variants={cardVariants}
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      position="relative"
      overflow="hidden"
      _hover={{ 
        bg: hoverBg,
        '& .building-icon': {
          transform: 'rotate(5deg) scale(1.1)',
          filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.2))'
        }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleUpgrade}
      cursor={building.locked ? 'not-allowed' : 'pointer'}
      opacity={building.locked ? 0.7 : 1}
      transition="all 0.3s ease"
      style={{
        transformOrigin: 'center bottom',
        willChange: 'transform, box-shadow, opacity',
      }}
    >
      {renderParticles()}
      
      {/* Lock overlay for locked buildings */}
      {building.locked && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          borderRadius="lg"
        >
          <Icon as={FaLock} color="white" boxSize={6} mb={2} />
          <Text color="white" fontSize="xs" fontWeight="bold">
            ZÁROLT
          </Text>
        </Box>
      )}
      {/* Glow effect on hover */}
      <Box
        as={motion.div}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={`linear(to-br, ${building.color}.500, transparent 60%)`}
        opacity={0}
        _hover={{
          opacity: 0.1
        }}
        transition="opacity 0.3s"
        pointerEvents="none"
      />
      <Flex justify="space-between" align="center" mb={3}>
        <HStack spacing={2}>
          <motion.div
            className="building-icon"
            initial={false}
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
              transition: {
                type: 'spring',
                stiffness: 500,
                damping: 15
              }
            }}
          >
            <Icon 
              as={building.icon} 
              color={`${building.color}.500`} 
              boxSize={5}
              filter="drop-shadow(0 0 2px rgba(0,0,0,0.2))"
              transition="all 0.3s ease"
            />
          </motion.div>
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Heading size="md">{building.name}</Heading>
          </motion.div>
        </HStack>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Badge 
            colorScheme={building.color} 
            fontSize="0.8em"
            px={2}
            py={1}
            borderRadius="full"
            boxShadow="sm"
          >
            {building.level}. szint
          </Badge>
        </motion.div>
      </Flex>
      
      <Box mb={4}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Text 
            fontSize="sm" 
            color={useColorModeValue('gray.600', 'gray.400')} 
            mb={2}
          >
            {building.description}
          </Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Text 
            fontSize="xs" 
            color={`${building.color}.400`} 
            mb={1}
            fontWeight="medium"
            display="inline-flex"
            alignItems="center"
            gap={1}
          >
            <Icon as={FaLeaf} />
            Termelés: {building.production}
          </Text>
        </motion.div>
        
        {building.isUpgrading ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <Box mt={3} pt={2} borderTopWidth="1px" borderTopColor={borderColor}>
              <Flex align="center" mb={2}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-flex' }}
                >
                  <Icon as={FaClock} mr={2} color="yellow.500" />
                </motion.div>
                <Text fontSize="xs" fontWeight="medium">Fejlesztés folyamatban</Text>
              </Flex>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box position="relative" w="100%" bg="gray.200" borderRadius="full" overflow="hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${building.progress}%`,
                      transition: {
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1]
                      }
                    }}
                    style={{
                      height: '8px',
                      background: 'linear-gradient(90deg, #F6E05E 0%, #D69E2E 100%)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      willChange: 'width'
                    }}
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      sx={{
                        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite',
                        '@keyframes shimmer': {
                          '0%': { backgroundPosition: '200% 0' },
                          '100%': { backgroundPosition: '-200% 0' }
                        }
                      }}
                    />
                  </motion.div>
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Text fontSize="xs" textAlign="right" mt={1} color="yellow.500">
                  {building.timeLeft}
                </Text>
              </motion.div>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="sm"
                colorScheme={building.color}
                width="100%"
                mt={3}
                rightIcon={<FaHammer />}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  _disabled: { transform: 'none', boxShadow: 'none' }
                }}
                _active={{
                  transform: 'translateY(0)'
                }}
                transition="all 0.2s"
                onClick={handleUpgrade}
              >
                Fejlesztés
              </Button>
            </motion.div>
          </motion.div>
        )}
      </Box>
      
      <Box>
        <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} mb={2}>
          Következő szint: {building.nextLevel}
        </Text>
        <Button 
          size="sm" 
          colorScheme={building.color} 
          leftIcon={<FaHammer />}
          width="100%"
          onClick={() => onUpgrade(building.id)}
          isDisabled={building.isUpgrading || building.locked}
        >
          {building.isUpgrading ? 'Folyamatban...' : 'Fejlesztés'}
        </Button>
      </Box>
    </Box>
  );
};

const DashboardHome = () => {
  const [buildings, setBuildings] = useState<Building[]>([
    {
      id: 1,
      name: 'Faház',
      level: 1,
      icon: FaHome,
      color: 'green',
      description: 'Fa alapanyagot termel',
      progress: 0.6,
      nextLevel: '2. szint',
      production: '5/perc',
      isUpgrading: false,
      timeLeft: '00:10:00',
      cost: { wood: 100, stone: 50, gold: 20 },
      unlocked: true,
      locked: false
    },
    {
      id: 2,
      name: 'Kőbánya',
      level: 2,
      icon: FaHammer,
      color: 'orange',
      description: 'Kő alapanyagot termel',
      progress: 0.3,
      nextLevel: '3. szint',
      production: '3/perc',
      isUpgrading: true,
      timeLeft: '00:30:00',
      cost: { wood: 200, stone: 100, gold: 50 },
      unlocked: true,
      locked: false
    },
    { 
      id: 3, 
      name: 'Aranybánya', 
      level: 1, 
      icon: FaCoins, 
      color: 'yellow',
      description: 'Aranytermelés fejlesztése',
      progress: 0,
      nextLevel: '2. szint',
      production: 'Arany: 10/óra',
      isUpgrading: false,
      timeLeft: '00:00:00',
      cost: { wood: 300, stone: 200, gold: 800 },
      unlocked: true,
      locked: false
    },
    { 
      id: 4, 
      name: 'Laktanya', 
      level: 1, 
      icon: FaShieldAlt, 
      color: 'red',
      description: 'Katonai egységek fejlesztése',
      progress: 0,
      nextLevel: '2. szint',
      production: 'Katonák: 2/óra',
      isUpgrading: false,
      timeLeft: '00:00:00',
      cost: { wood: 400, stone: 300, gold: 1000 },
      unlocked: true,
      locked: false
    },
    { 
      id: 5, 
      name: 'Varázskövek', 
      level: 0, 
      icon: FaMagic, 
      color: 'purple',
      description: 'Varázskövek termelése',
      progress: 0,
      nextLevel: '1. szint',
      production: 'Mana: 0/óra',
      isUpgrading: false,
      timeLeft: '00:00:00',
      unlocked: false,
      locked: true,
      cost: { wood: 500, stone: 500, gold: 1500 }
    },
    { 
      id: 6, 
      name: 'Kovácsműhely', 
      level: 0, 
      icon: FaFireAlt, 
      color: 'orange',
      description: 'Felszerelések készítése',
      progress: 0,
      nextLevel: '1. szint',
      production: 'Felszerelések: 0/óra',
      isUpgrading: false,
      timeLeft: '00:00:00',
      unlocked: false,
      locked: true,
      cost: { wood: 800, stone: 1000, gold: 2000 }
    },
  ]);

  const handleUpgrade = (buildingId: number) => {
    setBuildings(buildings.map(building => 
      building.id === buildingId 
        ? { ...building, isUpgrading: true, progress: 0 }
        : building
    ));
    
    // Simulate upgrade progress
    const interval = setInterval(() => {
      setBuildings(prevBuildings => 
        prevBuildings.map(building => {
          if (building.id === buildingId && building.isUpgrading) {
            const newProgress = building.progress + 5;
            if (newProgress >= 100) {
              clearInterval(interval);
              return {
                ...building,
                level: building.level + 1,
                isUpgrading: false,
                progress: 0,
                nextLevel: `${building.level + 2}. szint`,
                production: building.production.replace(/\d+/g, (match) => String(Math.floor(parseInt(match, 10) * 1.5)))
              };
            }
            return { ...building, progress: newProgress };
          }
          return building;
        })
      );
    }, 1000);
  };

  return (
    <Box p={{ base: 3, md: 6 }}>
      <VStack spacing={6} align="stretch" position="relative" zIndex={1}>
        {/* Floating Particles Background */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={-1}
          overflow="hidden"
          pointerEvents="none"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <Box
              key={i}
              as={motion.div}
              position="absolute"
              width={`${Math.random() * 6 + 2}px`}
              height={`${Math.random() * 6 + 2}px`}
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.1)"
              variants={particleVariants}
              initial="hidden"
              animate="visible"
              custom={i}
              style={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`
              }}
            />
          ))}
        </Box>
        {/* Daily Rewards & Achievements */}
        <SlideFade in={true} offsetY={20}>
          {/* ... */}
          <Box 
            bgGradient="linear(to-r, blue.900, purple.900)" 
            p={4} 
            borderRadius="lg"
            mb={6}
            position="relative"
            overflow="hidden"
            boxShadow="lg"
          >
            <Flex justify="space-between" align="center" mb={3}>
              <Box>
                <Heading size="md" color="white">Napi jutalmak</Heading>
                <Text fontSize="sm" color="gray.300">Jelentkezz be naponta további bónuszokért!</Text>
              </Box>
              <Button 
                colorScheme="yellow" 
                size="sm"
                leftIcon={<Icon as={FaCoins} />}
                _hover={{ transform: 'translateY(-2px)' }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
              >
                Jutalom felvétele
              </Button>
            </Flex>
            
            <SimpleGrid columns={7} spacing={2}>
              {['H', 'K', 'S', 'CS', 'P', 'SZO', 'V'].map((day, i) => (
                <Box 
                  key={day}
                  textAlign="center"
                  p={2}
                  borderRadius="md"
                  bg={i === 2 ? 'yellow.400' : 'whiteAlpha.100'}
                  color={i === 2 ? 'gray.800' : 'white'}
                  fontWeight={i === 2 ? 'bold' : 'normal'}
                  position="relative"
                  overflow="hidden"
                >
                  <Text fontSize="xs">{day}</Text>
                  <Text fontSize="xs">
                    {i === 2 ? '🎁' : i < 2 ? '✓' : i === 3 ? '2×' : i + 1}
                  </Text>
                  {i === 3 && (
                    <Box
                      position="absolute"
                      top={-1}
                      right={-1}
                      bg="red.500"
                      color="white"
                      fontSize="10px"
                      px={1}
                      borderRadius="full"
                      boxShadow="sm"
                    >
                      !
                    </Box>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </SlideFade>

        {/* Village Header */}
        <Flex 
          as={motion.div}
          align="center" 
          mb={6} 
          flexWrap="wrap"
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          <Box mr={4} mb={{ base: 3, md: 0 }}>
            <Box 
              p={3} 
              bg="rgba(49, 130, 206, 0.2)" 
              borderRadius="lg"
              display="inline-flex"
            >
              <FaHome size={28} color="#4299E1" />
            </Box>
          </Box>
          <Box flex="1" minW="200px">
            <Heading size="xl" mb={1}>Középfölde</Heading>
            <Text fontSize="md" color="gray.400">
              Szint: 3 | Következő szint: 1250/2000 XP
            </Text>
            <Progress value={62.5} size="sm" colorScheme="blue" borderRadius="full" mt={2} />
          </Box>
          <Box textAlign={{ base: 'left', md: 'right' }} mt={{ base: 3, md: 0 }}>
            <Text fontSize="sm" color="gray.400">Lakosság</Text>
            <HStack spacing={4}>
              <Text fontSize="lg" fontWeight="bold">
                <Icon as={FaUsers} color="blue.400" mr={1} /> 24/30
              </Text>
              <Button size="sm" colorScheme="blue" variant="ghost" leftIcon={<FaUsers />}>
                Továbbfejlesztés
              </Button>
            </HStack>
          </Box>
        </Flex>
        
        {/* Achievements */}
        <SlideFade in={true} offsetY={20}>
          <Box mb={8}>
            <Heading size="md" mb={4} display="flex" alignItems="center">
              <Icon as={FaTrophy} color="yellow.400" mr={2} />
              Elérhető teljesítmények
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              {[
                { icon: '🏗️', name: 'Első lépések', desc: 'Építsd meg első épületedet!' },
                { icon: '⚡', name: 'Gyors építő', desc: 'Fejleszd 5 épületet 1 percen belül' },
                { icon: '💰', name: 'Gazdagodás', desc: 'Gyűjts össze 10.000 aranyat' },
                { icon: '👑', name: 'Uralkodó', desc: 'Érj el 10-as szintet' },
              ].map((ach, i) => (
                <Box
                  key={i}
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      duration: 0.3,
                      delay: i * 0.1,
                      ease: 'easeOut'
                    }
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  p={3}
                  bg="whiteAlpha.100"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  cursor="pointer"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    bg: 'whiteAlpha.200',
                    '& .achievement-icon': {
                      transform: 'scale(1.1) rotate(5deg)'
                    }
                  }}
                >
                  <Tooltip label={ach.desc} hasArrow placement="top">
                    <Flex direction="column" align="center">
                      <Box 
                        className="achievement-icon"
                        fontSize="2xl"
                        mb={2}
                        sx={{
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)'
                          }
                        }}
                      >
                        {ach.icon}
                      </Box>
                      <Text fontSize="sm" textAlign="center" noOfLines={1}>
                        {ach.name}
                      </Text>
                      <Text fontSize="xs" color="gray.400" textAlign="center" noOfLines={1}>
                        {i === 0 ? 'Elérve' : 'Zárolva'}
                      </Text>
                    </Flex>
                  </Tooltip>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </SlideFade>

        {/* Buildings Grid */}
        <Box 
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg">Épületek</Heading>
            <Tooltip label="Itt kezelheted a falud épületeit és fejlesztéseidet" hasArrow>
              <Box>
                <Icon as={FaInfoCircle} color="blue.400" boxSize={5} />
              </Box>
            </Tooltip>
          </Flex>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {buildings.map((building) => (
              <BuildingCard 
                key={building.id} 
                building={building} 
                onUpgrade={handleUpgrade} 
              />
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
};

export default DashboardHome;
