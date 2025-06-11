import { Request, Response } from 'express';
import Village from '../models/Village';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { VillageDocument, Building, Resources } from '../types/express';

// Típusok a kérésekhez
export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
};

// Erőforrás költség típusa
interface ResourceCost {
  gold: number;
  wood: number;
  stone: number;
  iron: number;
  [key: string]: number;
}

interface VillageResources {
  gold: number;
  wood: number;
  stone: number;
  iron: number;
  food: number;
  lastUpdated: Date;
  [key: string]: any;
}

// Segédfüggvények
const calculateResourceProduction = (buildingType: string, level: number) => {
  const productionRates: Record<string, number> = {
    farm: 20,
    mine: 15,
    lumbermill: 10,
    // További épületek gyártási rátái
  };
  return (productionRates[buildingType] || 5) * level;
};

// Falu létrehozása
const createVillage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, coordinates } = req.body;
    const userId = req.user?.id;

    // Ellenőrizzük, hogy a felhasználónak már van-e falva
    const existingVillage = await Village.findOne({ userId });
    if (existingVillage) {
      return res.status(400).json({ message: 'Már van falva ennek a felhasználónak' });
    }

    // Alapértelmezett épületek
    const defaultBuildings = [
      { type: 'townhall', level: 1, position: { x: 0, y: 0 } },
      { type: 'farm', level: 1, position: { x: 1, y: 0 } },
      { type: 'lumbermill', level: 1, position: { x: -1, y: 0 } },
      { type: 'mine', level: 1, position: { x: 0, y: 1 } },
    ];

    const village = new Village({
      name,
      userId,
      coordinates: {
        x: coordinates?.x || Math.floor(Math.random() * 1000) - 500,
        y: coordinates?.y || Math.floor(Math.random() * 1000) - 500,
        region: coordinates?.region || 'greenfields'
      },
      buildings: defaultBuildings,
      resources: {
        gold: 1000,
        wood: 1000,
        stone: 1000,
        iron: 1000,
        food: 1000,
        lastUpdated: new Date()
      },
      population: {
        current: 10,
        max: 20
      }
    });

    await village.save();
    
    res.status(201).json({
      success: true,
      data: village
    });
  } catch (error) {
    console.error('Hiba a falu létrehozásakor:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a falu létrehozásakor'
    });
  }
};

// Felhasználó falujának lekérdezése
const getMyVillage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const village = await Village.findOne({ userId })
      .populate('userId', 'username email role');

    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Falu nem található ehhez a felhasználóhoz'
      });
    }

    // Frissítjük az erőforrásokat a legutóbbi frissítés óta eltelt idő alapján
    await updateVillageResources(village);
    
    res.status(200).json({
      success: true,
      data: village
    });
  } catch (error) {
    console.error('Hiba a falu betöltésekor:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a falu betöltésekor'
    });
  }
};

// Falu épületeinek lekérdezése
const getVillageBuildings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { villageId } = req.params;

    // Ellenőrizzük, hogy a kért falu a bejelentkezett felhasználóhoz tartozik-e
    const village = await Village.findOne({ _id: villageId, userId });
    
    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Falu nem található vagy nincs jogosultságod a megtekintéséhez'
      });
    }

    // Frissítjük az erőforrásokat a legutóbbi frissítés óta eltelt idő alapján
    await updateVillageResources(village);
    
    res.status(200).json({
      success: true,
      data: {
        buildings: village.buildings,
        resources: village.resources,
        population: village.population
      }
    });
  } catch (error) {
    console.error('Hiba az épületek betöltésekor:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az épületek betöltésekor'
    });
  }
};

// Épület fejlesztése
const upgradeBuilding = async (req: AuthenticatedRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const userId = req.user?.id;
    const { buildingId } = req.params;
    const { villageId } = req.body;

    // 1. Falu és épület megtalálása
    const village = await Village.findOne({ _id: villageId, userId }).session(session);
    if (!village) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Falu nem található'
      });
    }

    // Find the building by ID
    const building = village.buildings.find((b: { _id?: { toString: () => string } }) => b._id?.toString() === buildingId);
    if (!building) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Épület nem található'
      });
    }

    // 2. Ellenőrizzük, hogy fejleszthető-e az épület
    const nextLevel = building.level + 1;
    const upgradeCost = calculateUpgradeCost(building.type, nextLevel);

    // 3. Ellenőrizzük az erőforrásokat
    if (!hasEnoughResources(village.resources, upgradeCost)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Nincs elég erőforrás a fejlesztéshez'
      });
    }

    // 4. Levonjuk az erőforrásokat
    Object.keys(upgradeCost).forEach(resource => {
      (village.resources as any)[resource] -= upgradeCost[resource as keyof ResourceCost];
    });

    // 5. Frissítjük az épület szintjét
    building.level = nextLevel;
    building.lastUpgraded = new Date();
    building.isUnderConstruction = true;

    // 6. Mentés és tranzakció véglegesítése
    await village.save({ session });
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      data: {
        building,
        newResources: village.resources
      },
      message: 'Épület fejlesztése elindítva'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Hiba az épület fejlesztésekor:', error);
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az épület fejlesztésekor'
    });
  } finally {
    session.endSession();
  }
};

// Segédfüggvények
const calculateUpgradeCost = (buildingType: string, level: number): ResourceCost => {
  // Egyszerű költségszámítás, ezt később finomíthatjuk
  const baseCosts: Record<string, Record<string, number>> = {
    townhall: { gold: 500, wood: 300, stone: 350, iron: 200 },
    farm: { gold: 100, wood: 150, stone: 50, iron: 30 },
    lumbermill: { gold: 150, wood: 100, stone: 80, iron: 50 },
    mine: { gold: 200, wood: 150, stone: 100, iron: 50 },
    // További épületek alapköltségei
  };

  const baseCost = baseCosts[buildingType] || { gold: 100, wood: 100, stone: 100, iron: 100 };
  const multiplier = Math.pow(1.5, level - 1);

  return {
    gold: Math.floor(baseCost.gold * multiplier),
    wood: Math.floor(baseCost.wood * multiplier),
    stone: Math.floor(baseCost.stone * multiplier),
    iron: Math.floor(baseCost.iron * multiplier)
  };
};

const hasEnoughResources = (resources: VillageResources, costs: ResourceCost): boolean => {
  return Object.keys(costs).every(
    resource => resources[resource] >= costs[resource]
  );
};

const updateVillageResources = async (village: any): Promise<any> => {
  const now = new Date();
  const lastUpdated = village.resources.lastUpdated;
  const hoursPassed = (now.getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);

  if (hoursPassed <= 0) return village;

  // Frissítjük az erőforrásokat az eltelt idő alapján
  village.buildings.forEach((building: { type: string; level: number }) => {
    if (building.type === 'farm') {
      village.resources.food += calculateResourceProduction('farm', building.level) * hoursPassed;
    } else if (building.type === 'lumbermill') {
      village.resources.wood += calculateResourceProduction('lumbermill', building.level) * hoursPassed;
    } else if (building.type === 'mine') {
      village.resources.stone += calculateResourceProduction('mine', building.level) * hoursPassed;
      village.resources.iron += calculateResourceProduction('mine', building.level) * 0.7 * hoursPassed;
    }
  });

  // Frissítjük az utolsó frissítés időpontját
  village.resources.lastUpdated = now;
  
  // Elmentjük a változtatásokat
  await village.save();
  return village;
};

export {
  createVillage,
  getMyVillage,
  getVillageBuildings,
  upgradeBuilding
};
