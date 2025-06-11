import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Heading, Text, VStack, useToast } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Átirányítás, ha nincs bejelentkezve
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Sikeres kijelentkezés',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null; // Vagy egy betöltő komponens
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Heading as="h1" size="xl">Üdvözöllek, {user?.username}!</Heading>
              <Text color="gray.600" mt={2}>
                Ez a játék kezdőoldala. Itt fogod látni a karaktereidet és a játék állapotát.
              </Text>
            </Box>
            <Button colorScheme="red" onClick={handleLogout}>
              Kijelentkezés
            </Button>
          </Box>
          
          <Box mt={8} p={6} bg="white" borderRadius="lg" boxShadow="sm">
            <Heading as="h2" size="lg" mb={4}>Karaktereid</Heading>
            <Text>Még nincs karaktered. Hozz létre egyet a játék elkezdéséhez!</Text>
            <Button mt={4} colorScheme="blue">
              Új karakter létrehozása
            </Button>
          </Box>
          
          <Box mt={8} p={6} bg="white" borderRadius="lg" boxShadow="sm">
            <Heading as="h2" size="lg" mb={4}>Játékmenet</Heading>
            <Text>Itt fogod tudni folytatni a játékot, ha már van karaktered.</Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomePage;
