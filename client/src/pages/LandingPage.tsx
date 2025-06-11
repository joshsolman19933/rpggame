import { Box, Button, Container, Flex, Heading, Text, HStack, Image } from '@chakra-ui/react';
import { keyframes } from '@chakra-ui/system';
import { Link } from 'react-router-dom';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const LandingPage = () => {
  const floatAnimation = `${float} 6s ease-in-out infinite`;
  
  const features = [
    {
      icon: '🏰',
      title: 'Birodalom Építés',
      description: 'Építs erődöket, fejleszd városodat és hozz létre egy hatalmas birodalmat!'
    },
    {
      icon: '⚔️',
      title: 'Csaták',
      description: 'Küzdj hősies csatákban más játékosok ellen és szerezz győzelmet!'
    },
    {
      icon: '🤝',
      title: 'Szövetségek',
      description: 'Alkoss szövetségeket más játékosokkal és uraljátok együtt a térképet!'
    },
    {
      icon: '🏆',
      title: 'Ranglisták',
      description: 'Döntesd el, ki a legjobb a ranglisták élén!'
    }
  ];

  return (
    <Box w="100%" h="100%" color="white" m="0" p="0" overflowX="hidden">
      {/* Hero Section */}
      <Box 
        as="section"
        w="100%"
        minH="calc(100vh - 60px)"
        maxH="calc(100vh - 60px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
        m="0"
        p="0"
      >
        <Box
          as="div"
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgImage="url('https://placehold.co/1920x1080/1a202c/4a5568?text=Hero+Background')"
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
          opacity={0.1}
          zIndex={0}
          m="0"
          p="0"
        />
        
        <Container 
          position="relative" 
          zIndex={1} 
          p="0" 
          m="0 auto"
          h="auto"
          w="100%"
          maxW={{ base: '100%', lg: 'container.xl' }}
          px={{ base: 4, md: 6 }}
        >
          <Flex direction={{ base: 'column', lg: 'row' }} align="center" justify="space-between">
            <Box maxW={{ base: '100%', lg: '50%' }} mb={{ base: 12, lg: 0 }}>
              <Text color="brand.300" fontWeight="bold" mb={4} letterSpacing="wider">
                FEDEZD FEL A KÖZÉPKORI CSODÁKAT
              </Text>
              <Heading
                as="h1"
                size="3xl"
                fontWeight="extrabold"
                mb={6}
                bgGradient="linear(to-r, brand.300, brand.500)"
                bgClip="text"
                lineHeight="1.2"
              >
                Birodalmi Kalandok
              </Heading>
              <Text fontSize="xl" mb={8} color="gray.300">
                Építsd fel birodalmad a semmiből, hódítsd meg új területeket, és uralkodj a középkori világ felett ebben az izgalmas stratégiai játékban!
              </Text>
              <HStack spacing={4} flexWrap="wrap">
                <Button
                  as={Link}
                  to="/register"
                  size="lg"
                  colorScheme="brand"
                  px={8}
                  mb={{ base: 2, sm: 0 }}
                  _hover={{
                    transform: 'translateY(-3px)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                  }}
                  transition="all 0.3s"
                >
                  Kezdjük el most!
                </Button>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline"
                  size="lg"
                  colorScheme="whiteAlpha"
                  px={8}
                  _hover={{
                    bg: 'whiteAlpha.100',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                  }}
                  transition="all 0.3s"
                >
                  Bejelentkezés
                </Button>
              </HStack>
              <HStack mt={10} spacing={8} color="gray.400">
                <Text>🎮 100.000+ játékos</Text>
                <Text>🌍 10.000+ aktív birodalom</Text>
                <Text>⚔️ Napi 1.000+ csata</Text>
              </HStack>
            </Box>
            
            <Box
              animation={floatAnimation}
              display={{ base: 'none', lg: 'block' }}
              maxW="600px"
              position="relative"
            >
              <Image
                src="https://placehold.co/600x400/2d3748/ffffff?text=Game+Screenshot"
                alt="Középkori város"
                width="100%"
                height="auto"
                borderRadius="lg"
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                border="4px solid"
                borderColor="brand.700"
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg="gray.800">
        <Container maxW="container.xl">
          <Box textAlign="center" mb={16}>
            <Text color="brand.300" fontWeight="bold" mb={4} letterSpacing="wider">
              MIÉRT MINKET VÁLASZTANÁL?
            </Text>
            <Heading as="h2" size="2xl" mb={6}>
              Fedezd fel a játék világát
            </Heading>
            <Box w={24} h={1} bg="brand.500" mx="auto" mb={12} />
          </Box>

          <Flex wrap="wrap" justify="center" gap={8}>
            {features.map((feature, index) => (
              <Box
                key={index}
                flex={{ base: '1 1 100%', md: '1 1 45%', lg: '1 1 22%' }}
                p={6}
                bg="gray.750"
                borderRadius="lg"
                textAlign="center"
                _hover={{
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                }}
                transition="all 0.3s"
              >
                <Text fontSize="4xl" mb={4}>
                  {feature.icon}
                </Text>
                <Heading as="h3" size="lg" mb={3} color="brand.300">
                  {feature.title}
                </Heading>
                <Text color="gray.400">
                  {feature.description}
                </Text>
              </Box>
            ))}
          </Flex>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bgGradient="linear(to-r, brand.700, brand.900)" position="relative" overflow="hidden">
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage="url('https://placehold.co/1920x400/2d3748/4a5568?text=Call+To+Action')"
          bgSize="cover"
          bgPosition="center"
          opacity={0.1}
          zIndex={0}
        />
        <Container maxW="container.lg" position="relative" zIndex={1} textAlign="center">
          <Heading as="h2" size="2xl" mb={6}>
            Készen állsz a kihívásra?
          </Heading>
          <Text fontSize="xl" mb={8} maxW="2xl" mx="auto">
            Csatlakozz több tízezer játékoshoz, és kezdd el építeni a saját középkori birodalmadat még ma!
          </Text>
          <Button
            as={Link}
            to="/register"
            size="lg"
            colorScheme="whiteAlpha"
            bg="whiteAlpha.200"
            _hover={{
              bg: 'whiteAlpha.300',
              transform: 'translateY(-3px)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
            }}
            px={12}
            py={6}
            fontSize="lg"
            fontWeight="bold"
            transition="all 0.3s"
          >
            INGYENES REGISZTRÁCIÓ
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" py={8} borderTop="1px solid" borderColor="gray.800">
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
            <Text color="gray.500" mb={{ base: 4, md: 0 }}>
              © {new Date().getFullYear()} Birodalmi Kalandok. Minden jog fenntartva.
            </Text>
            <HStack spacing={6}>
              <Link to="/privacy" style={{ color: '#a0aec0' }}>Adatvédelem</Link>
              <Link to="/terms" style={{ color: '#a0aec0' }}>Felhasználási feltételek</Link>
              <Link to="/contact" style={{ color: '#a0aec0' }}>Kapcsolat</Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
