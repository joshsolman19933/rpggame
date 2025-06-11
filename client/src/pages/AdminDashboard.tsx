// React & Hooks
import { useState, useCallback, FC, useEffect } from 'react';

// Chakra UI Components
import {
  Box,
  Heading,
  TabList,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
  Tab,
  TabPanel,
  Icon,
} from '@chakra-ui/react';

// Icons
import { FiHome, FiUser, FiMap } from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';

// API & Types
import { buildingsAPI, usersAPI } from '../services/api';

// Temporary type definitions - replace with actual types from your project
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

interface Building {
  id: string;
  name: string;
  level: number;
  // Add other building properties as needed
}

interface ManagerProps {
  handleBuildingLevelChange?: (buildingId: string, value: string | number) => void;
  saveBuildingLevel?: (buildingId: string) => Promise<void>;
  handleDeleteConfirm?: () => Promise<void>;
}

const AdminDashboard: FC = () => {
  // State for active tab
  const [activeTab] = useState(0);
  
  // Initialize toast
  const toast = useToast();
  
  // Users state
  const [, setUsers] = useState<User[]>([]);
  
  // Buildings state
  const [villageId] = useState('');
  const [villageBuildings, setVillageBuildings] = useState<Building[]>([]);
  const [editingBuildings, setEditingBuildings] = useState<Record<string, number>>({});
  const [, setIsLoadingBuildings] = useState(false);
  
  // Modals and dialogs
  const { onClose: onDeleteDialogClose } = useDisclosure();

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const { data } = await usersAPI.getUsers();
      setUsers(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba';
      toast({
        title: 'Hiba történt a felhasználók betöltésekor',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Load buildings
  const loadBuildings = useCallback(async () => {
    if (!villageId) return;
    
    setIsLoadingBuildings(true);
    try {
      const response = await buildingsAPI.getVillageBuildings(villageId);
      const buildings = response.data.buildings || [];
      setVillageBuildings(buildings);
      
      // Initialize editing state
      const initialEditingState: Record<string, number> = {};
      buildings.forEach((building: Building) => {
        initialEditingState[building.id] = building.level;
      });
      setEditingBuildings(initialEditingState);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba';
      toast({
        title: 'Hiba történt az épületek betöltésekor',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingBuildings(false);
    }
  }, [villageId, toast]);

  // Handle building level change
  const handleBuildingLevelChange = useCallback((buildingId: string, value: string | number) => {
    const level = typeof value === 'string' ? parseInt(value, 10) : value;
    setEditingBuildings((prev) => ({
      ...prev,
      [buildingId]: level
    }));
  }, []);

  // Save building level
  const saveBuildingLevel = useCallback(async (buildingId: string) => {
    if (!villageId) return;
    
    const newLevel = editingBuildings[buildingId];
    const building = villageBuildings.find((b) => b.id === buildingId);
    
    if (!building || building.level === newLevel) return;
    
    try {
      await buildingsAPI.updateBuildingLevel(villageId, buildingId, newLevel);
      setVillageBuildings((prev) =>
        prev.map((b) => (b.id === buildingId ? { ...b, level: newLevel } : b))
      );
      
      toast({
        title: 'Épület szint frissítve',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba';
      setEditingBuildings((prev) => ({
        ...prev,
        [buildingId]: building.level
      }));
      
      toast({
        title: 'Hiba történt a frissítés során',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [villageId, editingBuildings, villageBuildings, toast]);

  // Handle user deletion
  const handleDeleteConfirm = useCallback(async () => {
    try {
      // Placeholder for user deletion logic
      await usersAPI.deleteUser('user-id');
      await loadUsers();
      onDeleteDialogClose();
      
      toast({
        title: 'Felhasználó törölve',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba';
      toast({
        title: 'Hiba történt a törlés során',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [loadUsers, onDeleteDialogClose, toast]);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 0) {
      loadUsers();
    } else if (activeTab === 1) {
      loadBuildings();
    }
  }, [activeTab, loadUsers, loadBuildings]);

  // Export functions that might be used by child components
  const adminFunctions = {
    handleBuildingLevelChange,
    saveBuildingLevel,
    handleDeleteConfirm,
  };

  // Placeholder components for tabs
  const UsersManager: FC<ManagerProps> = () => (
    <Box p={4}>
      <Text>Felhasználók kezelése</Text>
    </Box>
  );

  const BuildingsManager: FC<ManagerProps> = () => (
    <Box p={4}>
      <Text>Épületek kezelése</Text>
    </Box>
  );

  const MapManager: FC<ManagerProps> = () => (
    <Box p={4}>
      <Text>Térkép kezelése</Text>
      <Text>Itt jelenik majd a térkép kezelő.</Text>
    </Box>
  );

  const ResearchManager: FC<ManagerProps> = () => (
    <Box p={4}>
      <Text>Kutatások kezelése</Text>
      <Text>Itt jelennek majd meg a kutatások.</Text>
    </Box>
  );

  return (
    <Box p={4}>
      <Tabs index={activeTab} isLazy>
        <TabList>
          <Tab><Icon as={FiUser} mr={2} />Felhasználók</Tab>
          <Tab><Icon as={FiHome} mr={2} />Épületek</Tab>
          <Tab><Icon as={FiMap} mr={2} />Térkép</Tab>
          <Tab><Icon as={FaFlask} mr={2} />Kutatások</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={4}><UsersManager {...adminFunctions} /></TabPanel>
          <TabPanel p={4}><BuildingsManager {...adminFunctions} /></TabPanel>
          <TabPanel p={4}><MapManager {...adminFunctions} /></TabPanel>
          <TabPanel p={4}><ResearchManager {...adminFunctions} /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminDashboard;
