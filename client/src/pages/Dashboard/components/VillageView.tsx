import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid, 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter, 
  Button, 
  useColorModeValue,
  Badge,
  Flex,
  Progress,
  Tooltip,
  Icon,
  VStack,
  HStack,
  useToast,
  Image,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  IconButton
} from '@chakra-ui/react';
import { 
  FaHammer, 
  FaClock, 
  FaInfoCircle, 
  FaCoins, 
  FaLeaf, 
  FaMountain, 
  FaIndustry,
  FaHome,
  FaShieldAlt,
  FaFistRaised,
  FaArrowUp,
  FaSyncAlt
} from 'react-icons/fa';
import { Building, VillageData } from '../../../types/buildings';
import { fetchVillageData, startUpgrade, collectResources } from '../../../services/villageService';
import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';

// Egyszerű épület kártya komponens
const BuildingCard: React.FC<{
  name: string;
  level: number;
  description: string;
  isUpgrading?: boolean;
  upgradeTime?: number;
  onUpgrade?: () => void;
}> = ({ name, level, description, isUpgrading = false, upgradeTime, onUpgrade }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Card 
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <CardHeader pb={0}>
        <Flex justify="space-between" align="center">
          <Heading size="md">{name}</Heading>
          <Badge colorScheme="green" fontSize="0.8em">{level}. szint</Badge>
        </Flex>
      </CardHeader>
      
      <CardBody>
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={4}>
          {description}
        </Text>
        
        {isUpgrading && upgradeTime && (
          <Box mb={4}>
            <Flex align="center" mb={1}>
              <Icon as={FaClock} mr={2} color="yellow.500" />
              <Text fontSize="sm">Fejlesztés folyamatban</Text>
            </Flex>
            <Progress value={60} size="sm" colorScheme="yellow" borderRadius="full" />
            <Text fontSize="xs" textAlign="right" mt={1}>
              {upgradeTime} perc van hátra
            </Text>
          </Box>
        )}
      </CardBody>
      
      <CardFooter pt={0}>
        <Button 
          size="sm" 
          colorScheme="blue" 
          leftIcon={<FaHammer />}
          width="100%"
          onClick={onUpgrade}
          isDisabled={isUpgrading}
        >
          {isUpgrading ? 'Folyamatban...' : 'Fejlesztés'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const VillageView: React.FC = () => {
  // Példa adatok - ezeket később a valós adatokkal fogjuk helyettesíteni
  const buildings = [
    {
      id: 1,
      name: 'Faház',
      level: 3,
      description: 'A faház a falud alapvető épülete, itt élnek a falusiak.',
      isUpgrading: false
    },
    {
      id: 2,
      name: 'Favágó',
      level: 2,
      description: 'A favágó fát termel, ami az építkezések alapanyaga.',
      isUpgrading: true,
      upgradeTime: 15
    },
    {
      id: 3,
      name: 'Kőbánya',
      level: 1,
      description: 'A kőbánya követ termel, ami az erősebb épületekhez szükséges.',
      isUpgrading: false
    },
    {
      id: 4,
      name: 'Földműves ház',
      level: 2,
      description: 'A földműves ház élelmet termel a falusiak számára.',
      isUpgrading: false
    },
    {
      id: 5,
      name: 'Laktanya',
      level: 1,
      description: 'A laktanyában kiképezheted a katonáidat a falu védelmére.',
      isUpgrading: false
    },
    {
      id: 6,
      name: 'Kutatóközpont',
      level: 0,
      description: 'A kutatóközpontban új technológiákat fejleszthetsz ki.',
      isUpgrading: false
    },
  ];

  const handleUpgrade = (buildingId: number) => {
    // Itt lesz a fejlesztés indítása
    console.log(`Fejlesztés indítása: ${buildingId}`);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" mb={1}>Falum</Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Kezdd el fejleszteni a faludat, hogy erősebbé válj!
          </Text>
        </Box>
        
        <Tooltip 
          label="A falud fejlődésével új épületeket és képességeket nyithatsz meg."
          hasArrow
          placement="left"
        >
          <Box>
            <Icon as={FaInfoCircle} color="blue.400" boxSize={5} />
          </Box>
        </Tooltip>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
        {buildings.map((building) => (
          <BuildingCard
            key={building.id}
            name={building.name}
            level={building.level}
            description={building.description}
            isUpgrading={building.isUpgrading}
            upgradeTime={building.upgradeTime}
            onUpgrade={() => handleUpgrade(building.id)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default VillageView;
