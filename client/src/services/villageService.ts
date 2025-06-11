import { Building, VillageData } from '../types/buildings';

const API_BASE_URL = '/api/v1/village';

// Mock adatok - ezeket később lecseréljük valós API hívásokra
export const mockVillageData: VillageData = {
  id: 'village-123',
  name: 'Első Falu',
  level: 3,
  experience: 1250,
  experienceToNextLevel: 2000,
  resources: {
    wood: 1500,
    stone: 1200,
    iron: 800,
    gold: 2500,
    food: 3000,
    capacity: 10000,
  },
  lastUpdated: new Date().toISOString(),
  buildings: [
    {
      id: 'town-hall',
      name: 'Városháza',
      description: 'A falu központja. Itt kezelheted a faludat.',
      level: 3,
      maxLevel: 20,
      upgradeTime: 3600, // 1 óra másodpercben
      upgradeCost: {
        wood: 800,
        stone: 1000,
        iron: 500,
        gold: 1200,
      },
      productionRate: 0,
      isUpgrading: false,
      category: 'infrastructure',
      image: '/assets/buildings/town-hall.png',
    },
    {
      id: 'lumber-camp',
      name: 'Favágó tábor',
      description: 'Fát termel a falu építkezéseihez.',
      level: 2,
      maxLevel: 20,
      upgradeTime: 1800, // 30 perc
      upgradeCost: {
        wood: 500,
        stone: 200,
        iron: 100,
        gold: 800,
      },
      productionRate: 5,
      isUpgrading: false,
      category: 'resource',
      image: '/assets/buildings/lumber-camp.png',
    },
    // További épületek...
  ],
};

export const fetchVillageData = async (): Promise<VillageData> => {
  // Valós API hívással kellene lecserélni
  // const response = await fetch(`${API_BASE_URL}/data`);
  // return response.json();
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockVillageData), 500); // Szimulált késleltetés
  });
};

export const startUpgrade = async (buildingId: string): Promise<{ success: boolean; message: string }> => {
  // Valós API hívással kellene lecserélni
  // const response = await fetch(`${API_BASE_URL}/upgrade`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ buildingId }),
  // });
  // return response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const building = mockVillageData.buildings.find(b => b.id === buildingId);
      if (building) {
        building.isUpgrading = true;
        building.upgradeEndsAt = new Date(Date.now() + building.upgradeTime * 1000).toISOString();
        resolve({ success: true, message: 'Fejlesztés elindítva!' });
      } else {
        resolve({ success: false, message: 'Épület nem található!' });
      }
    }, 500);
  });
};

export const collectResources = async (): Promise<{ success: boolean; resources: { [key: string]: number } }> => {
  // Valós API hívással kellene lecserélni
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        resources: {
          wood: 150,
          stone: 80,
          iron: 50,
          gold: 200,
        },
      });
    }, 500);
  });
};
