import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  // FormHelperText,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  VStack,
  HStack,
  Divider,
  IconButton,
  usePrefersReducedMotion,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';
import { Image } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import type { LoginCredentials } from '../types/auth';

// Animációk
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  
  const { login } = useAuth();
  const toast = useToast();
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // floatAnimation konstans eltávolítva, mert jelenleg nem használjuk
  const fadeInAnimation = prefersReducedMotion ? undefined : `${fadeIn} 0.5s ease-out`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Töröljük a hibaüzenetet, ha a felhasználó elkezd gépelni
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<LoginCredentials> = {};
    
    if (!formData.email) {
      newErrors.email = 'Az email cím kötelező';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Érvénytelen email cím';
    }
    
    if (!formData.password) {
      newErrors.password = 'A jelszó kötelező';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A jelszónak legalább 6 karakter hosszúnak kell lennie';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { success, error } = await login(formData);
    
    if (success) {
      toast({
        title: 'Sikeres bejelentkezés!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Redirect to dashboard after successful login
      navigate('/dashboard');
      // Az átirányítást most már a ProtectedRoute kezeli
    } else {
      toast({
        title: 'Hiba történt a bejelentkezés során',
        description: error || 'Hibás email cím vagy jelszó.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Box w="100%" minH="100vh" position="relative" overflow="hidden" bg="gray.900">
      {/* Háttérkép és overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgImage="url('https://images.unsplash.com/photo-1587842608501-2393a1c08126?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')"
        bgSize="cover"
        bgPosition="center"
        bgAttachment="fixed"
        filter="brightness(0.4)"
        zIndex={-1}
      />
      
      {/* Vissza gomb */}
      <Button
        as={RouterLink}
        to="/"
        position="absolute"
        top={4}
        left={4}
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        color="white"
        _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
        zIndex={1}
      >
        Vissza a főoldalra
      </Button>

      <Container maxW="container.lg" minH="100vh" display="flex" alignItems="center" justifyContent="center" py={20}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="center"
          w="100%"
          gap={12}
        >
          {/* Bal oldali tartalom */}
          <Box
            flex={1}
            textAlign={{ base: 'center', lg: 'left' }}
            animation={!prefersReducedMotion ? `${fadeInAnimation} 0.5s ease-out` : undefined}
            data-aos="fade-right"
            maxW={{ base: '100%', lg: '50%' }}
          >
            <Heading
              as="h1"
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="bold"
              mb={6}
              color="white"
              lineHeight="1.2"
              textShadow="0 2px 4px rgba(0, 0, 0, 0.5)"
            >
              Üdv újra a<br />
              <Box as="span" color="brand.300">Birodalmi Kalandok</Box> világában!
            </Heading>
            
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.300"
              mb={8}
              maxW="md"
              mx={{ base: 'auto', lg: '0' }}
            >
              Jelentkezz be, hogy folytasd hősi utadat, és csatlakozz a közösséghez!
            </Text>
            
            <VStack spacing={4} align={{ base: 'center', lg: 'flex-start' }} mb={8}>
              {[
                'Kövesd nyomon a birodalmad fejlődését',
                'Csatlakozz klánokhoz és szövetségekhez',
                'Vegyél részt izgalmas küldetésekben',
                'Fedezd fel a középkori világ rejtelmeit'
              ].map((feature, index) => (
                <HStack key={index} spacing={3}>
                  <Box color="brand.300" fontSize="xl">
                    {['📊', '🤝', '🎯', '🔍'][index]}
                  </Box>
                  <Text color="gray.300" fontSize="lg">
                    {feature}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
          
          {/* Jobb oldali űrlap */}
          <Box
            w="100%"
            maxW="md"
            bg="rgba(17, 24, 39, 0.8)"
            backdropFilter="blur(10px)"
            p={8}
            borderRadius="lg"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            boxShadow="xl"
            animation={!prefersReducedMotion ? `${fadeInAnimation} 0.5s ease-out` : undefined}
            data-aos="fade-left"
          >
            <VStack spacing={6} align="stretch">
              <Box textAlign="center" mb={6}>
                <Heading as="h2" size="xl" color="white" mb={2}>
                  Bejelentkezés
                </Heading>
                <Text color="gray.400">
                  Add meg a belépési adataidat a folytatáshoz
                </Text>
              </Box>
              
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel color="gray.300">Email cím</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="pelda@email.com"
                      size="lg"
                      bg="rgba(0, 0, 0, 0.3)"
                      borderColor="rgba(255, 255, 255, 0.1)"
                      color="white"
                      _hover={{ borderColor: 'brand.400' }}
                      _focus={{
                        borderColor: 'brand.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                      }}
                      _placeholder={{ color: 'gray.500' }}
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel color="gray.300">Jelszó</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        size="lg"
                        bg="rgba(0, 0, 0, 0.3)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        color="white"
                        _hover={{ borderColor: 'brand.400' }}
                        _focus={{
                          borderColor: 'brand.400',
                          boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                        }}
                        _placeholder={{ color: 'gray.500' }}
                        pr="4.5rem"
                      />
                      <InputRightElement h="100%" width="4.5rem">
                        <IconButton
                          aria-label={showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          bg="transparent"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                          _active={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                          icon={showPassword ? <ViewOffIcon color="gray.400" /> : <ViewIcon color="gray.400" />}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="100%"
                    mt={2}
                    isLoading={isLoading}
                    loadingText="Bejelentkezés..."
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.2s"
                  >
                    Bejelentkezés
                  </Button>
                </VStack>
              </form>
              
              <HStack spacing={2} justify="center" mt={4}>
                <Text color="gray.400">Még nincs fiókod?</Text>
                <Link 
                  as={RouterLink} 
                  to="/register" 
                  color="brand.300" 
                  fontWeight="medium"
                  _hover={{ textDecoration: 'underline', color: 'brand.200' }}
                >
                  Regisztrálj most!
                </Link>
              </HStack>
              
              <HStack my={4}>
                <Divider borderColor="gray.600" />
                <Text color="gray.500" fontSize="sm" px={2}>VAGY</Text>
                <Divider borderColor="gray.600" />
              </HStack>
              
              <Button
                variant="outline"
                colorScheme="gray"
                leftIcon={<Image src="https://www.google.com/favicon.ico" boxSize="20px" alt="Google" />}
                w="100%"
                _hover={{
                  bg: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'gray.400',
                }}
              >
                Bejelentkezés Google fiókkal
              </Button>
              
              <Text textAlign="center" mt={4} fontSize="sm" color="gray.500">
                <Link 
                  as={RouterLink} 
                  to="/forgot-password" 
                  _hover={{ textDecoration: 'underline', color: 'gray.400' }}
                >
                  Elfelejtetted a jelszavad?
                </Link>
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default LoginPage;
