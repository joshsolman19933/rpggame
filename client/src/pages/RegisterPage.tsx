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
  FormHelperText,
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
  Progress,
  Checkbox,
  usePrefersReducedMotion,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, ArrowBackIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterCredentials } from '../types/auth';

// Animációk
export const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

export const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterCredentials & { confirmPassword: string; termsAccepted: boolean }>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterCredentials & { termsAccepted: string }>>({});
  const [passwordFocus, setPasswordFocus] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Jelszó erősség ellenőrzése
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength / 4; // 0-1 közötti érték
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthColor = passwordStrength < 0.5 ? 'red' : passwordStrength < 0.75 ? 'yellow' : 'green';
  const passwordStrengthText = 
    passwordStrength < 0.25 ? 'Gyenge' : 
    passwordStrength < 0.5 ? 'Közepes' : 
    passwordStrength < 0.75 ? 'Erős' : 'Nagyon erős';

  const passwordRequirements = [
    { text: 'Legalább 8 karakter hosszú', valid: formData.password.length >= 8 },
    { text: 'Tartalmaz kis- és nagybetűt', valid: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
    { text: 'Tartalmaz számot', valid: /[0-9]/.test(formData.password) },
    { text: 'Tartalmaz speciális karaktert', valid: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'A felhasználónév kötelező';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'A felhasználónév 3 és 20 karakter között kell legyen';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Csak betűk, számok és alulvonás engedélyezett';
    }
    
    if (!formData.email) {
      newErrors.email = 'Az email cím kötelező';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Érvénytelen email cím formátum';
    }
    
    if (!formData.password) {
      newErrors.password = 'A jelszó kötelező';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A jelszónak legalább 6 karakter hosszúnak kell lennie';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'A jelszavak nem egyeznek';
    }
    
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'El kell fogadnod a feltételeket';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const { success, error } = await register(formData);
      
      if (success) {
        toast({
          title: 'Sikeres regisztráció!',
          description: 'Most már bejelentkezhet a fiókjába.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        
        // Redirect to login page after successful registration
        navigate('/login');
      } else if (error) {
        toast({
          title: 'Hiba történt',
          description: error || 'Ismeretlen hiba történt a regisztráció során',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      toast({
        title: 'Hiba történt',
        description: error instanceof Error ? error.message : 'Ismeretlen hiba történt a regisztráció során',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
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
        bgImage="url('/assets/images/tavern-interior.jpg')"
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
              Csatlakozz a<br />
              <Box as="span" color="brand.300">Birodalmi Kalandok</Box> közösségéhez!
            </Heading>
            
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.300"
              mb={8}
              maxW="md"
              mx={{ base: 'auto', lg: '0' }}
            >
              Regisztrálj most, és kezdd el kalandodat a középkori világban, ahol dicsőséget és gazdagságot szerezhetsz!
            </Text>
            
            <VStack spacing={4} align={{ base: 'center', lg: 'flex-start' }} mb={8}>
              {[
                'Küzdj hősies csatákban',
                'Építs birodalmat',
                'Szerezz ritka kincseket',
                'Ismerj meg más hősöket'
              ].map((feature, index) => (
                <HStack key={index} spacing={3}>
                  <Box color="brand.300" fontSize="xl">
                    {['⚔️', '🏰', '💰', '👥'][index]}
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
                  Regisztráció
                </Heading>
                <Text color="gray.400">
                  Hozz létre egy fiókot, hogy elkezdd a kalandot!
                </Text>
              </Box>
              
              <form onSubmit={handleSubmit}>
                <VStack spacing={5}>
                  <FormControl isInvalid={!!errors.username}>
                    <FormLabel color="gray.300">Felhasználónév</FormLabel>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="hoseg_nevem"
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
                    <FormHelperText color="gray.500">
                      3-20 karakter, csak betűk, számok és alulvonás
                    </FormHelperText>
                    <FormErrorMessage>{errors.username}</FormErrorMessage>
                  </FormControl>

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
                        onFocus={() => setPasswordFocus(true)}
                        onBlur={() => setPasswordFocus(false)}
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
                    
                    {(passwordFocus || formData.password) && (
                      <Box mt={3}>
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.400">Jelszó erőssége:</Text>
                          <Text 
                            fontSize="sm" 
                            color={`${passwordStrengthColor}.400`}
                            fontWeight="medium"
                          >
                            {passwordStrengthText}
                          </Text>
                        </Flex>
                        <Progress 
                          value={passwordStrength * 100} 
                          size="xs" 
                          colorScheme={passwordStrengthColor}
                          borderRadius="full"
                          mb={2}
                        />
                        <VStack align="stretch" spacing={1} mt={2}>
                          {passwordRequirements.map((req, index) => (
                            <HStack key={index} spacing={2}>
                              <Box color={req.valid ? 'green.400' : 'gray.500'}>
                                {req.valid ? <CheckIcon boxSize={3} /> : <CloseIcon boxSize={2.5} />}
                              </Box>
                              <Text 
                                fontSize="xs" 
                                color={req.valid ? 'gray.400' : 'gray.500'}
                              >
                                {req.text}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel color="gray.300">Jelszó megerősítése</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
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
                          aria-label={showConfirmPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          bg="transparent"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                          _active={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                          icon={showConfirmPassword ? <ViewOffIcon color="gray.400" /> : <ViewIcon color="gray.400" />}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.termsAccepted}>
                    <Checkbox
                      name="termsAccepted"
                      isChecked={formData.termsAccepted}
                      onChange={handleChange}
                      colorScheme="brand"
                      size="lg"
                    >
                      <Text color="gray.300" fontSize="sm">
                        Elfogadom a{' '}
                        <Link as={RouterLink} to="/terms" color="brand.400" _hover={{ textDecoration: 'underline' }}>
                          Felhasználási feltételeket
                        </Link>{' '}
                        és az{' '}
                        <Link as={RouterLink} to="/privacy" color="brand.400" _hover={{ textDecoration: 'underline' }}>
                          Adatvédelmi szabályzatot
                        </Link>
                      </Text>
                    </Checkbox>
                    <FormErrorMessage>{errors.termsAccepted}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="100%"
                    mt={2}
                    isLoading={isLoading}
                    loadingText="Regisztrálás..."
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.2s"
                  >
                    Regisztráció
                  </Button>

                  <Divider my={4} borderColor="rgba(255, 255, 255, 0.1)" />

                  <Text textAlign="center" color="gray.400" fontSize="sm">
                    Már van fiókod?{' '}
                    <Link 
                      as={RouterLink} 
                      to="/login" 
                      color="brand.300" 
                      fontWeight="medium"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      Jelentkezz be!
                    </Link>
                  </Text>
                </VStack>
              </form>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default RegisterPage;
