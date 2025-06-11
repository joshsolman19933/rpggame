import { MapTile, MapData, MapEvent } from '../types/map';

// Ideiglenes adatok a fejlesztéshez
const generateMap = (): MapData => {
  const width = 20;
  const height = 15;
  const tiles: MapTile[][] = [];
  
  // Játékos pozíciója a térkép közepén
  const playerX = Math.floor(width / 2);
  const playerY = Math.floor(height / 2);
  
  // Térkép generálása
  for (let y = 0; y < height; y++) {
    const row: MapTile[] = [];
    for (let x = 0; x < width; x++) {
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2)
      );
      
      // Kezdetben csak a közeli mezők legyenek felfedezve
      const isExplored = distanceFromCenter <= 3;
      
      // Véletlenszerű mezőtípus generálás
      const rand = Math.random();
      let type: 'erdo' | 'hegy' | 'folyo' | 'siksag' = 'siksag';
      
      if (rand > 0.7) type = 'erdo';
      else if (rand > 0.5) type = 'hegy';
      else if (rand > 0.3) type = 'folyo';
      
      // Játékos pozíciója
      const hasPlayer = x === playerX && y === playerY;
      
      // Ellenség vagy nyersanyag véletlenszerű elhelyezése
      let hasEnemy = false;
      let hasResource = false;
      
      if (!hasPlayer && isExplored) {
        hasEnemy = Math.random() > 0.9;
        hasResource = !hasEnemy && Math.random() > 0.85;
      }
      
      row.push({
        id: y * width + x,
        type,
        hasPlayer,
        hasEnemy,
        hasResource,
        isExplored,
        x,
        y
      });
    }
    tiles.push(row);
  }
  
  return {
    tiles,
    playerPosition: {
      x: playerX,
      y: playerY
    },
    size: {
      width,
      height
    }
  };
};

// Térkép betöltése
const fetchMap = async (): Promise<MapData> => {
  // Később itt lesz API hívás
  return new Promise((resolve) => {
    // Szimuláljuk a hálózati késleltetést
    setTimeout(() => {
      resolve(generateMap());
    }, 500);
  });
};

// Mező felfedezése
const exploreTile = async (x: number, y: number): Promise<{success: boolean; events: MapEvent[]}> => {
  // Később itt lesz API hívás
  return new Promise((resolve) => {
    setTimeout(() => {
      // Véletlenszerű események generálása a felfedezéskor
      const events: MapEvent[] = [];
      const eventTypes: Array<MapEvent['type']> = ['enemy', 'resource', 'discovery', 'treasure'];
      
      // 50% eséllyel történjen valami
      if (Math.random() > 0.5) {
        const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        events.push({
          id: `event-${Date.now()}`,
          type: randomEventType,
          position: { x, y },
          data: {},
          timestamp: new Date().toISOString()
        });
      }
      
      resolve({
        success: true,
        events
      });
    }, 300);
  });
};

// Játékos mozgatása
const movePlayer = async (x: number, y: number): Promise<{success: boolean; message?: string}> => {
  // Később itt lesz API hívás
  return new Promise((resolve) => {
    setTimeout(() => {
      // Egyszerű validáció a mozgáshoz
      if (x < 0 || y < 0 || x >= 20 || y >= 15) {
        resolve({
          success: false,
          message: 'Nem léphetsz a térkép szélére!'
        });
      } else {
        resolve({
          success: true
        });
      }
    }, 200);
  });
};

export const mapService = {
  fetchMap,
  exploreTile,
  movePlayer
};

export default mapService;
