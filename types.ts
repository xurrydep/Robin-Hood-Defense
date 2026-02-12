
export interface GameState {
  score: number;
  health: number;
  level: number;
  isGameOver: boolean;
  isGameStarted: boolean;
  isContractDeployed: boolean;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  speed: number;
  health: number;
  maxHealth: number;
  type: 'soldier' | 'knight' | 'giant';
}

export interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Transaction {
  hash: string;
  method: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

export interface BlockchainState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  network: string;
  transactions: Transaction[];
  isDeploying: boolean;
}
