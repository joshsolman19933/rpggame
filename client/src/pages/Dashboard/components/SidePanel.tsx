import React from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Divider, 
  Badge, 
  HStack, 
  Icon, 
  Flex,
  Button,
  Progress
} from '@chakra-ui/react';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaInfoCircle,
  FaGift
} from 'react-icons/fa';
import { GiSwordman } from 'react-icons/gi';

// Notification card component
const NotificationCard: React.FC<{
  type: 'warning' | 'success' | 'info' | 'gift';
  title: string;
  message: string;
  time: string;
}> = ({ type, title, message, time }) => {
  const iconMap = {
    warning: FaExclamationTriangle,
    success: FaCheckCircle,
    info: FaInfoCircle,
    gift: FaGift
  };
  
  const colorMap = {
    warning: 'orange.500',
    success: 'green.500',
    info: 'blue.500',
    gift: 'purple.500'
  };
  
  const IconComponent = iconMap[type] || FaInfoCircle;
  
  return (
    <Box 
      p={3} 
      borderRadius="md"
      bg="rgba(26, 32, 44, 0.95)"
      borderLeft="4px solid"
      borderLeftColor={colorMap[type]}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.2)"
      mb={3}
    >
      <HStack align="flex-start" spacing={3}>
        <Icon as={IconComponent} color={colorMap[type]} boxSize={5} mt={0.5} />
        <Box flex={1}>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontWeight="bold" fontSize="sm" color="white">{title}</Text>
            <Text fontSize="xs" color="gray.400">{time}</Text>
          </Flex>
          <Text fontSize="sm" color="gray.300">
            {message}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

// Active quest card component
const QuestCard: React.FC<{
  title: string;
  description: string;
  progress: number;
  reward: string;
  timeLeft: string;
}> = ({ title, description, progress, reward, timeLeft }) => (
  <Box 
    p={4} 
    borderRadius="md"
    bg="rgba(26, 32, 44, 0.95)"
    boxShadow="0 2px 10px rgba(0, 0, 0, 0.2)"
    mb={4}
    borderWidth="1px"
    borderColor="rgba(255, 255, 255, 0.1)"
  >
    <HStack justify="space-between" mb={2}>
      <Text fontWeight="bold" fontSize="md" color="white">{title}</Text>
      <Badge colorScheme="green" fontSize="xs">{timeLeft} left</Badge>
    </HStack>
    
    <Text fontSize="sm" color="gray.300" mb={3}>
      {description}
    </Text>
    
    <Progress 
      value={progress} 
      size="sm" 
      colorScheme="blue" 
      borderRadius="full" 
      mb={3} 
      bg="rgba(255, 255, 255, 0.1)"
    />
    
    <Flex justify="space-between" align="center">
      <Text fontSize="sm" color="yellow.300" fontWeight="medium">
        <Icon as={FaGift} mr={1} /> {reward}
      </Text>
      <Button 
        size="xs" 
        colorScheme="blue"
        _hover={{
          bg: 'blue.500',
          transform: 'translateY(-1px)'
        }}
      >
        Continue
      </Button>
    </Flex>
  </Box>
);

const SidePanel: React.FC = () => {
  // Example notifications
  const notifications = [
    {
      id: 1,
      type: 'warning' as const,
      title: 'Low Resources!',
      message: 'Your stone is running low, upgrade your quarry!',
      time: '5m ago'
    },
    {
      id: 2,
      type: 'success' as const,
      title: 'Upgrade Complete!',
      message: 'Your lumber mill has been upgraded to level 3!',
      time: '15m ago'
    },
    {
      id: 3,
      type: 'gift' as const,
      title: 'Daily Reward!',
      message: 'Claim your daily reward: 500 gold!',
      time: '1h ago'
    }
  ];
  
  // Example quests
  const activeQuests = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Upgrade your lumber mill to level 3',
      progress: 66,
      reward: '1000 gold',
      timeLeft: '2h'
    },
    {
      id: 2,
      title: 'Village Defense',
      description: 'Train 5 soldiers',
      progress: 20,
      reward: '500 wood, 500 stone',
      timeLeft: '1d'
    }
  ];

  return (
    <Box 
      w={{ base: '100%', lg: '320px' }} 
      p={4}
      bg="rgba(26, 32, 44, 0.95)"
      borderLeftWidth={{ base: 0, lg: '1px' }}
      borderTopWidth={{ base: '1px', lg: 0 }}
      borderColor="rgba(255, 255, 255, 0.1)"
      overflowY="auto"
      h={{ base: 'auto', lg: '100%' }}
      maxH={{ base: '400px', lg: 'none' }}
      sx={{
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      {/* Notifications section */}
      <Box mb={6}>
        <HStack mb={3}>
          <Icon as={FaBell} color="blue.400" />
          <Heading size="md" color="white">Notifications</Heading>
          <Badge 
            colorScheme="blue" 
            borderRadius="full" 
            px={2}
            bg="rgba(66, 153, 225, 0.2)"
            color="blue.300"
          >
            {notifications.length}
          </Badge>
        </HStack>
        
        <VStack spacing={2} align="stretch">
          {notifications.map(notification => (
            <NotificationCard key={notification.id} {...notification} />
          ))}
        </VStack>
      </Box>
      
      <Divider my={4} borderColor="rgba(255, 255, 255, 0.1)" />
      
      {/* Active quests section */}
      <Box>
        <HStack mb={3}>
          <Icon as={GiSwordman} color="green.400" />
          <Heading size="md" color="white">Active Quests</Heading>
        </HStack>
        
        <VStack spacing={4} align="stretch">
          {activeQuests.map(quest => (
            <QuestCard key={quest.id} {...quest} />
          ))}
        </VStack>
      </Box>
      
      <Divider my={4} borderColor="rgba(255, 255, 255, 0.1)" />
      
      {/* Player stats section */}
      <Box>
        <HStack mb={3}>
          <Icon as={FaInfoCircle} color="purple.400" />
          <Heading size="md" color="white">Status</Heading>
        </HStack>
        
        <VStack spacing={2} align="stretch">
          <Flex justify="space-between">
            <Text fontSize="sm" color="gray.400">
              Playtime:
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="white">2h 15m</Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontSize="sm" color="gray.400">
              Guild:
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="blue.300">
              No guild
            </Text>
          </Flex>
          
          <Flex justify="space-between">
            <Text fontSize="sm" color="gray.400">
              Next level:
            </Text>
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="white" textAlign="right">
                1,250/2,000 XP
              </Text>
              <Progress 
                value={62.5} 
                size="xs" 
                colorScheme="purple" 
                borderRadius="full" 
                mt={1}
                bg="rgba(255, 255, 255, 0.1)"
              />
            </Box>
          </Flex>
        </VStack>
      </Box>
      
      <Divider my={4} borderColor="rgba(255, 255, 255, 0.1)" />
      
      {/* Upcoming events */}
      <Box>
        <Text fontSize="sm" color="gray.400" mb={2}>
          Upcoming Events
        </Text>
        <VStack spacing={2} align="stretch">
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="white">Daily Reset</Text>
            <Text fontSize="xs" color="gray.500">In 3h 22m</Text>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="white">Guild War</Text>
            <Text fontSize="xs" color="gray.500">Tomorrow, 20:00</Text>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
};

export default SidePanel;
