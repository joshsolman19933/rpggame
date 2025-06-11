import React, { useState } from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { useChat } from '../../../hooks/useChat';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  // Initialize chat hook
  const {
    messages,
    activeChannel,
    sendMessage,
    isLoading,
    error,
    isTyping,
    typingUsers
  } = useChat('global');
  
  // Dark theme colors
  const bgColor = 'rgba(26, 32, 44, 0.95)';
  const borderColor = 'rgba(255, 255, 255, 0.1)';
  const inputBg = 'rgba(45, 55, 72, 0.7)';
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChannel) return;
    
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      toast({
        title: 'Hiba történt',
        description: 'Nem sikerült elküldeni az üzenetet',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Format time from ISO string
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Box 
      position="fixed"
      bottom={0}
      left={{ base: 0, lg: '200px' }}
      right={0}
      bg={bgColor}
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor={borderColor}
      zIndex={10}
      maxH={isExpanded ? '80vh' : '50px'}
      transition="all 0.3s ease"
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.2)"
      display="flex"
      flexDirection="column"
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
        <Box flex="1" overflowY="auto" p={4} position="relative">
          {isLoading && messages.length === 0 ? (
            <VStack spacing={4} justify="center" h="100%">
              <Spinner size="xl" color="blue.400" />
              <Text color="whiteAlpha.700">Üzenetek betöltése...</Text>
            </VStack>
          ) : error ? (
            <VStack spacing={4} justify="center" h="100%" color="red.400">
              <FaExclamationCircle size={32} />
              <Text>Hiba történt az üzenetek betöltésekor</Text>
              <Button 
                size="sm" 
                colorScheme="red" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Újrapróbálás
              </Button>
            </VStack>
          ) : (
            <>
              {messages.map((msg) => (
                <Message
                  key={msg.id}
                  sender={msg.senderName || 'Ismeretlen'}
                  message={msg.content}
                  time={formatTime(msg.timestamp)}
                  isCurrentUser={msg.senderId === 'current-user-id'}
                  avatar={msg.senderAvatar}
                />
              ))}
              {isTyping && typingUsers.length > 0 && (
                <Box mb={2} ml={2}>
                  <Text fontSize="xs" color="whiteAlpha.600">
                    {typingUsers.map(u => u.id).join(', ')} {typingUsers.length === 1 ? 'gépel...' : 'gépelnek...'}
                  </Text>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>
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
              placeholder="Írj egy üzenetet..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              bg={inputBg}
              border="none"
              color="white"
              _placeholder={{ color: 'whiteAlpha.600' }}
              _focus={{ boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.6)' }}
              flex="1"
              isDisabled={isLoading}
              onFocus={() => {
                // Notify server user is typing
                // This would be handled by the useChat hook
              }}
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
