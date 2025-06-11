import React from 'react';
import { 
  Flex, 
  Box, 
  Text, 
  Icon, 
  Tooltip,
  Progress,
  useColorModeValue
} from '@chakra-ui/react';
import { FaTree, FaMountain, FaBreadSlice, FaCoins } from 'react-icons/fa';

interface ResourceItemProps {
  icon: any;
  value: number;
  max: number;
  label: string;
  color: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ icon, value, max, label, color }) => (
  <Tooltip label={`${label}: ${value}/${max}`} hasArrow>
    <Box 
      bg={useColorModeValue('white', 'gray.800')} 
      p={3} 
      borderRadius="md"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      flex="1"
      minW={{ base: '120px', sm: '140px' }}
      mr={2}
      mb={2}
    >
      <Flex align="center" mb={1}>
        <Icon as={icon} color={`${color}.500`} mr={2} />
        <Text fontWeight="medium" fontSize="sm">{label}</Text>
      </Flex>
      <Flex justify="space-between" fontSize="sm" mb={1}>
        <Text>{value.toLocaleString()}</Text>
        <Text color="gray.500">/ {max.toLocaleString()}</Text>
      </Flex>
      <Progress 
        value={(value / max) * 100} 
        size="sm" 
        colorScheme={color}
        borderRadius="full"
        bg={useColorModeValue(`${color}.100`, `${color}.900`)}
      />
    </Box>
  </Tooltip>
);

const ResourceBar: React.FC = () => {
  // Példa adatok - ezeket később a valós adatokkal fogjuk helyettesíteni
  const resources = [
    { icon: FaTree, value: 1250, max: 2000, label: 'Fa', color: 'green' },
    { icon: FaMountain, value: 875, max: 2000, label: 'Kő', color: 'blue' },
    { icon: FaBreadSlice, value: 2500, max: 5000, label: 'Élelem', color: 'yellow' },
    { icon: FaCoins, value: 3200, max: 10000, label: 'Arany', color: 'yellow' },
  ];

  return (
    <Flex 
      wrap="wrap" 
      mb={6} 
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      borderRadius="lg"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      {resources.map((resource, index) => (
        <ResourceItem key={index} {...resource} />
      ))}
    </Flex>
  );
};

export default ResourceBar;
