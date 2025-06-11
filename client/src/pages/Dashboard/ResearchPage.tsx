import React from 'react';
import { Box, Container, Heading, VStack, Text, Icon } from '@chakra-ui/react';
import { FaFlask } from 'react-icons/fa';
import ResearchView from '../../components/research/ResearchView';

// Mock VillageContext since it's not available
const useVillage = () => ({
  villageData: {
    level: 1,
    buildings: [
      { id: 'town_hall', level: 1 },
      { id: 'lumber_camp', level: 1 },
      { id: 'quarry', level: 1 },
      { id: 'iron_mine', level: 1 },
      { id: 'farm', level: 1 },
      { id: 'barracks', level: 1 },
    ],
    resources: {
      wood: 1000,
      stone: 1000,
      iron: 500,
      gold: 200,
      food: 2000,
    },
  },
  loading: false,
  error: null,
});

const ResearchPage: React.FC = () => {
  const { villageData, loading, error } = useVillage();

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Falu adatainak betöltése...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.400">Hiba történt a falu adatainak betöltésekor.</Text>
      </Box>
    );
  }

  if (!villageData) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Nem található falu. Hozz létre egy új falut a kezdéshez.</Text>
      </Box>
    );
  }

  // Prepare building levels for research requirements
  const buildingLevels = villageData.buildings.reduce<Record<string, number>>(
    (acc, building) => ({
      ...acc,
      [building.id]: building.level
    }),
    {}
  );

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Container maxW="container.xl" p={0}>
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="xl" display="flex" alignItems="center" mb={2}>
              <Icon as={FaFlask} color="blue.400" mr={3} />
              Kutatás
            </Heading>
            <Text color="gray.300" maxW="3xl">
              Fejleszd faludat új technológiákkal és képességekkel. Minden kutatás javítja a falu hatékonyságát, vagy új lehetőségeket nyit meg.
            </Text>
          </Box>

          <Box mt={6}>
            <ResearchView
              villageLevel={villageData.level}
              buildingLevels={buildingLevels}
              resources={villageData.resources}
              onResearchCompleted={(researchId) => {
                // Handle research completion (e.g., show notification, update resources)
                console.log(`Research completed: ${researchId}`);
              }}
            />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ResearchPage;
