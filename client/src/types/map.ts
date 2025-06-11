export interface MapTile {
  id: number;
  type: 'erdo' | 'hegy' | 'folyo' | 'siksag';
  hasPlayer: boolean;
  hasEnemy: boolean;
  hasResource: boolean;
  isExplored: boolean;
  x: number;
  y: number;
}

export interface MapData {
  tiles: MapTile[][];
  playerPosition: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface MapEvent {
  id: string;
  type: 'enemy' | 'resource' | 'discovery' | 'treasure';
  position: {
    x: number;
    y: number;
  };
  data: any;
  timestamp: string;
}
