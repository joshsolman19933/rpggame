import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Input, 
  Button, 
  Text, 
  Avatar, 
  IconButton,
  Divider,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge
} from '@chakra-ui/react';
import { 
  FaPaperPlane, 
  FaSmile, 
  FaImage, 
  FaChevronUp, 
  FaChevronDown,
  FaGlobe,
  FaUserFriends,
  FaHashtag,
  FaCog
} from 'react-icons/fa';

// Chat message component
const Message: React.FC<{
  sender: string;
  message: string;
  time: string;
  isCurrentUser?: boolean;
  avatar?: string;
}> = ({ sender, message, time, isCurrentUser = false, avatar }) => {
  const bgColor = isCurrentUser ? 'rgba(49, 130, 206, 0.2)' : 'rgba(74, 85, 104, 0.3)';
  
  return (
    <Flex 
      direction={isCurrentUser ? 'row-reverse' : 'row'}
      mb={3}
      maxW="80%"
      ml={isCurrentUser ? 'auto' : 0}
    >
      {!isCurrentUser && (
        <Avatar 
          size="sm" 
          name={sender} 
          src={avatar}
          mr={2}
          mt={1}
        />
      )}
      
      <Box>
        <Box
          bg={bgColor}
          px={4}
          py={2}
          borderRadius="lg"
          borderTopLeftRadius={isCurrentUser ? 'lg' : '0'}
          borderTopRightRadius={isCurrentUser ? '0' : 'lg'}
        >
          {!isCurrentUser && (
            <Text fontSize="xs" fontWeight="bold" mb={1}>
              {sender}
            </Text>
          )}
          <Text fontSize="sm">{message}</Text>
        </Box>
        <Text 
          fontSize="xs" 
          color="gray.400" 
          textAlign={isCurrentUser ? 'right' : 'left'}
          mt={1}
          px={2}
        >
          {time}
        </Text>
      </Box>
    </Flex>
  );
};

// Channel selector component
const ChannelSelector: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState('global');
  
  const channels = [
    { id: 'global', icon: FaGlobe, label: 'Globális chat', unread: 3 },
    { id: 'clan', icon: FaUserFriends, label: 'Klán chat', unread: 0 },
    { id: 'trading', icon: FaHashtag, label: 'Kereskedés', unread: 0 },
  ];
  
  return (
    <Menu>
      <MenuButton 
        as={Button} 
        size="sm" 
        variant="ghost" 
        rightIcon={<FaChevronDown size={12} />}
        leftIcon={<FaGlobe />}
        px={3}
        color="whiteAlpha.800"
        _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
      >
        {channels.find(c => c.id === activeChannel)?.label}
      </MenuButton>
      <MenuList bg="rgba(26, 32, 44, 0.95)" borderColor="rgba(255, 255, 255, 0.1)">
        {channels.map(channel => (
          <MenuItem 
            key={channel.id}
            icon={<channel.icon />}
            onClick={() => setActiveChannel(channel.id)}
            bg="transparent"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Flex justify="space-between" align="center" w="100%">
              <Text color="whiteAlpha.900">{channel.label}</Text>
              {channel.unread > 0 && (
                <Badge colorScheme="red" borderRadius="full" px={2}>
                  {channel.unread}
                </Badge>
              )}
            </Flex>
          </MenuItem>
        ))}
        <Divider my={1} borderColor="rgba(255, 255, 255, 0.1)" />
        <MenuItem 
          icon={<FaCog />}
          bg="transparent"
          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
        >
          <Text color="whiteAlpha.900">Chat beállítások</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

// Main ChatPanel component
const ChatPanel: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Dark theme colors
  const bgColor = 'rgba(26, 32, 44, 0.95)';
  const borderColor = 'rgba(255, 255, 255, 0.1)';
  const inputBg = 'rgba(45, 55, 72, 0.7)';
  
  // Sample messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Harcos123',
      message: 'Sziasztok! Új vagyok itt, valaki segítene elindulni?',
      time: '10:23',
      avatar: 'https://i.pravatar.cc/150?u=harcos123'
    },
    {
      id: 2,
      sender: 'Varázsló',
      message: 'Üdvözöllek! Miben segíthetek?',
      time: '10:25',
      avatar: 'https://i.pravatar.cc/150?u=varazslo'
    },
    {
      id: 3,
      sender: 'Te',
      message: 'Köszönöm, már megtaláltam a választ!',
      time: '10:26',
      isCurrentUser: true
    },
  ]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: 'Te',
      message: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };
  
  return (
    <Box 
      position="fixed"
      bottom={0}
      left={{ base: 0, lg: '200px' }}
      right={0}
      bg={bgColor}
      borderTopWidth="1px"
      borderColor={borderColor}
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.2)"
      zIndex="sticky"
      maxH={isExpanded ? '400px' : '40px'}
      transition="max-height 0.3s ease"
    >
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        p={2}
        bg="rgba(26, 32, 44, 0.95)"
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <ChannelSelector />
        <IconButton
          aria-label={isExpanded ? 'Chat becsukása' : 'Chat kibontása'}
          icon={isExpanded ? <FaChevronDown /> : <FaChevronUp />}
          size="sm"
          variant="ghost"
          color="whiteAlpha.800"
          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
        />
      </Flex>

      {/* Messages */}
      <Box
        p={4}
        overflowY="auto"
        maxH="300px"
        display={isExpanded ? 'block' : 'none'}
      >
        {messages.map(msg => (
          <Message
            key={msg.id}
            sender={msg.sender}
            message={msg.message}
            time={msg.time}
            isCurrentUser={msg.isCurrentUser}
            avatar={msg.avatar}
          />
        ))}
      </Box>
      
      {/* Message form */}
      <Box
        p={2}
        borderTopWidth="1px"
        borderColor={borderColor}
        display={isExpanded ? 'block' : 'none'}
      >
        <form onSubmit={handleSendMessage}>
          <Flex>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Írd ide az üzeneted..."
              size="sm"
              borderRadius="full"
              bg={inputBg}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.400' }}
              _focus={{
                borderColor: 'blue.400',
                boxShadow: '0 0 0 1px #3182ce',
              }}
              color="whiteAlpha.900"
              _placeholder={{ color: 'whiteAlpha.600' }}
              borderRightRadius={0}
              borderRight="none"
            />
            <Button
              type="submit"
              colorScheme="blue"
              size="sm"
              borderLeftRadius={0}
              borderTopLeftRadius={0}
              borderBottomLeftRadius={0}
              leftIcon={<FaPaperPlane />}
              _hover={{
                bg: 'blue.500',
              }}
            >
              Küldés
            </Button>
          </Flex>
          <Flex justify="space-between" mt={2} px={2}>
            <HStack spacing={2}>
              <IconButton
                aria-label="Hangulatjel"
                icon={<FaSmile />}
                variant="ghost"
                size="sm"
                color="whiteAlpha.700"
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              />
              <IconButton
                aria-label="Kép küldése"
                icon={<FaImage />}
                variant="ghost"
                size="sm"
                color="whiteAlpha.700"
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              />
            </HStack>
            <Text fontSize="xs" color="whiteAlpha.600">
              Enter a küldéshez, Shift+Enter az új sorhoz
            </Text>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default ChatPanel;
