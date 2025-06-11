import { Box, Container, Heading, Text, VStack, HStack, Badge, Icon, Link } from '@chakra-ui/react';
import { FaGithub, FaCode, FaServer, FaMobile, FaGamepad, FaUsers, FaDesktop, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

interface UpdateItem {
  version: string;
  date: string;
  changes: string[];
  status: string;
  icon: any;
  iconColor: string;
}

interface FocusItem {
  title: string;
  items: string[];
  icon: any;
  iconColor: string;
}

interface UpdateItem {
  version: string;
  date: string;
  changes: string[];
  status: string;
  icon: any;
  iconColor: string;
}

interface FocusItem {
  title: string;
  items: string[];
  icon: any;
  iconColor: string;
}

const DocumentationPage = () => {
  // Sötét mód fix színek
  const cardBg = 'rgba(26, 32, 44, 0.95)';
  const borderColor = 'rgba(255, 255, 255, 0.1)';
  const textColor = 'rgba(255, 255, 255, 0.92)';
  const mutedTextColor = 'rgba(255, 255, 255, 0.7)';

  // Fejlesztési területek eltávolítva, mert jelenleg nem használjuk

  const updates: UpdateItem[] = [
    {
      version: '0.2.1',
      date: '2025.06.09',
      changes: [
        'Teljes sötét mód bevezetése',
        'Komponensek átírása és optimalizálása',
        'Stílusok egységesítése',
        'Hibajavítások és teljesítményjavítások',
      ],
      status: 'Kész',
      icon: FaCheckCircle,
      iconColor: 'green.400'
    },
    {
      version: '0.2.0',
      date: '2025.06.01',
      changes: [
        'Dashboard komponensek fejlesztése',
        'Felhasználói felület finomhangolása',
        'Reszponzív tervezés fejlesztése',
      ],
      status: 'Kész',
      icon: FaCheckCircle,
      iconColor: 'green.400'
    },
    {
      version: '0.3.0',
      date: '2025.06.15',
      changes: [
        'Hibaellenőrzések és peremhatáresetek kezelése',
        'Betöltési állapotok implementálása',
        'Komponensek egységtesztelése',
      ],
      status: 'Folyamatban',
      icon: FaExclamationTriangle,
      iconColor: 'yellow.400'
    },
  ];

  const currentFocus: FocusItem[] = [
    {
      title: 'Aktuális fókusz',
      items: [
        'Dashboard komponensek fejlesztése',
        'Felhasználói felület finomhangolása',
        'Reszponzív tervezés biztosítása',
      ],
      icon: FaInfoCircle,
      iconColor: 'blue.400'
    },
    {
      title: 'Ismert problémák',
      items: [
        'Néhány komponens mobil nézetben lehetne jobban reszponzív',
        'Dinamikus adatok háttérrendszerrel való integrációja folyamatban',
        'Animációk optimalizálása szükséges',
      ],
      icon: FaExclamationTriangle,
      iconColor: 'orange.400'
    }
  ];

  // Görgetősáv stílusok
  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.3)',
      },
    },
  };

  return (
    <Box 
      minH="calc(100vh - 60px)" 
      bgGradient="linear(to-b, gray.900, gray.800)" 
      color="white" 
      py={12} 
      px={[4, 6, 8]}
      css={scrollbarStyles}
    >
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          {/* Fejléc */}
          <VStack spacing={4} textAlign="center" mb={8}>
            <HStack spacing={4} mb={6}>
              <Icon as={FaCode} w={10} h={10} color="brand.300" />
              <Box>
                <Heading as="h1" size="2xl" bgGradient="linear(to-r, brand.300, blue.400)" bgClip="text" mb={2}>
                  Fejlesztői Dokumentáció
                </Heading>
                <Text fontSize="xl" color={mutedTextColor} maxW="2xl">
                  Kövesd nyomon a játék fejlesztésének folyamatát, terveinket és a legújabb frissítéseket.
                  A projekt jelenleg fejlesztés alatt áll, és folyamatosan bővül új funkciókkal.
                </Text>
              </Box>
            </HStack>
          </VStack>

          {/* Rendszerkövetelmények */}
          <Box>
            <VStack align="flex-start" spacing={2} mb={6}>
              <Heading size="xl" color="brand.200">Rendszerkövetelmények</Heading>
              <Box h="4px" w="80px" bgGradient="linear(to-r, brand.300, blue.400)" borderRadius="full" />
            </VStack>
            <Box 
              p={8} 
              bg={cardBg} 
              borderRadius="xl" 
              border="1px" 
              borderColor={borderColor}
              boxShadow="lg"
            >
              <HStack spacing={8} flexWrap="wrap" justifyContent="space-around">
                <VStack spacing={2} align="center">
                  <Icon as={FaDesktop} w={8} h={8} color="blue.400" />
                  <Text fontWeight="bold" fontSize="lg" color={textColor}>Asztali számítógép</Text>
                  <Text fontSize="md" color={mutedTextColor} textAlign="center">
                    Windows 10/11, macOS 10.15+, Linux
                    <br />
                    Chrome, Firefox, Edge, Safari legfrissebb verziói
                  </Text>
                </VStack>
                <VStack spacing={2} align="center">
                  <Icon as={FaMobile} w={8} h={8} color="green.400" />
                  <Text fontWeight="bold" fontSize="lg" color={textColor}>Mobil eszközök</Text>
                  <Text fontSize="md" color={mutedTextColor} textAlign="center">
                    iOS 14+, Android 10+
                    <br />
                    Chrome, Safari legfrissebb verziói
                  </Text>
                </VStack>
                <VStack spacing={2} align="center">
                  <Icon as={FaServer} w={8} h={8} color="purple.400" />
                  <Text fontWeight="bold" fontSize="lg" color={textColor}>Szerver</Text>
                  <Text fontSize="md" color={mutedTextColor} textAlign="center">
                    Node.js 16+
                    <br />
                    MongoDB 5.0+
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </Box>

          {/* Aktuális állapot */}
          <Box>
            <VStack align="flex-start" spacing={2} mb={6}>
              <Heading size="xl" color="brand.200">Aktuális állapot</Heading>
              <Box h="4px" w="80px" bgGradient="linear(to-r, brand.300, blue.400)" borderRadius="full" />
            </VStack>
            <HStack spacing={6} align="stretch" flexWrap="wrap" justify="space-between" mb={8}>
              {currentFocus.map((section, index) => (
                <Box 
                  key={`focus-${index}`}
                  flex="1"
                  minW="300px"
                  p={6} 
                  bg={cardBg} 
                  borderRadius="lg" 
                  border="1px" 
                  borderColor={borderColor}
                  boxShadow="md"
                >
                  <HStack mb={4} spacing={3}>
                    <Icon as={section.icon} color={section.iconColor} w={5} h={5} />
                    <Heading size="md">{section.title}</Heading>
                  </HStack>
                  <VStack align="stretch" spacing={3}>
                    {section.items.map((item, i) => (
                      <HStack key={i} spacing={3}>
                        <Box w="6px" h="6px" borderRadius="full" bg="brand.300" mt={1.5} flexShrink={0} />
                        <Text color={textColor} fontSize="md">{item}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              ))}
            </HStack>
          </Box>

          {/* Frissítések */}
          <Box>
            <VStack align="flex-start" spacing={2} mb={6}>
              <Heading size="xl" color="brand.200">Frissítések</Heading>
              <Box h="4px" w="80px" bgGradient="linear(to-r, brand.300, blue.400)" borderRadius="full" />
            </VStack>
            <VStack spacing={4} align="stretch">
              {updates.map((update, index) => (
                <Box 
                  key={index}
                  p={6} 
                  bg={cardBg} 
                  borderRadius="lg" 
                  border="1px" 
                  borderColor={borderColor}
                  boxShadow="md"
                  position="relative"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '6px',
                    bg: update.iconColor,
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px'
                  }}
                >
                  <HStack justify="space-between" mb={4}>
                    <HStack spacing={3}>
                      <Icon as={update.icon} color={update.iconColor} w={5} h={5} />
                      <Heading size="md">Verzió {update.version}</Heading>
                      <Badge 
                        colorScheme={
                          update.status === 'Kész' ? 'green' : 
                          update.status === 'Folyamatban' ? 'blue' : 'gray'
                        } 
                        px={3} 
                        py={1} 
                        borderRadius="full"
                      >
                        {update.status}
                      </Badge>
                    </HStack>
                    <Text color={mutedTextColor} fontSize="sm">{update.date}</Text>
                          borderRadius="full"
                          fontSize="sm"
                          colorScheme={
                            update.status === 'Kész' ? 'green' : 
                            update.status === 'Folyamatban' ? 'blue' : 'gray'
                          }
                        >
                          {update.status}
                        </Badge>
                        <Text fontSize="sm" color={mutedTextColor}>
                          {update.date !== 'Tervezett' ? 'Kiadva:' : 'Tervezett'}
                        </Text>
                      </HStack>
                      
                      <VStack align="stretch" spacing={3} mt={2}>
                        {update.changes.map((change, i) => (
                          <HStack 
                            key={i} 
                            spacing={3} 
                            p={2}
                            bg={useColorModeValue('whiteAlpha.100', 'blackAlpha.300')}
                            borderRadius="lg"
                            _hover={{
                              bg: useColorModeValue('whiteAlpha.200', 'blackAlpha.400'),
                            }}
                            transition="background 0.2s"
                          >
                            <Box 
                              w={6} 
                              h={6} 
                              borderRadius="full" 
                              bgGradient="linear(to-br, brand.300, blue.400)" 
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                            >
                              <Text fontSize="xs" fontWeight="bold" color="white">
                                {i + 1}
                              </Text>
                            </Box>
                            <Text fontSize="md" color={textColor}>
                              {change}
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Lábléc */}
          <Box 
            mt={16} 
            pt={8} 
            borderTop="1px" 
            borderColor={borderColor}
            textAlign="center"
          >
            <Text color={mutedTextColor} mb={4}>
              2025 Középkori Fantasy MMORPG - Minden jog fenntartva
            </Text>
            <HStack spacing={4} justify="center">
              <Link href="https://github.com/yourusername/rpg-game" isExternal>
                <Icon as={FaGithub} w={6} h={6} color={mutedTextColor} _hover={{ color: 'white' }} />
              </Link>
              <Link href="/docs" color={mutedTextColor} _hover={{ color: 'white', textDecoration: 'underline' }}>
                Dokumentáció
              </Link>
              <Link href="/privacy" color={mutedTextColor} _hover={{ color: 'white', textDecoration: 'underline' }}>
                Adatvédelem
              </Link>
              <Link href="/terms" color={mutedTextColor} _hover={{ color: 'white', textDecoration: 'underline' }}>
                Felhasználási feltételek
              </Link>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default DocumentationPage;
