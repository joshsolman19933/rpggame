import { Spinner, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
}

const LoadingSpinner = ({ 
  size = 'xl',
  message = 'Betöltés...' 
}: LoadingSpinnerProps) => {
  return (
    <VStack spacing={4} justify="center" minH="200px">
      <Spinner
        thickness='4px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size={size}
      />
      {message && (
        <Text fontSize='md' color='gray.400'>
          {message}
        </Text>
      )}
    </VStack>
  );
};

export default LoadingSpinner;
