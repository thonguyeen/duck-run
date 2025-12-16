
export type RacerType = 'duck' | 'horse' | 'ostrich' | 'rabbit' | 'squirrel' | 'bee';

export type DisplayMode = 'name' | 'code' | 'both';

export type GameMode = 'free' | 'elimination' | 'tournament';

export interface Racer {
  id: string;
  code: string; // New field for the racer's ID code (e.g., "01")
  name: string;
  color: string;
  position: number; // 0 to 100
  speed: number;
  isFinished: boolean;
  rank: number | null;
  waddleState: number; // For animation timing offset
  type: RacerType;
  
  // Momentum Mechanics
  currentSpeedMultiplier: number; // The current factor applied to base speed
  speedChangeTimer: number;       // Frames remaining until next speed change
}

export interface PlayerScore {
  name: string;
  score: number;
  wins: number;
}

export enum GameState {
  SETUP = 'SETUP',
  COUNTDOWN = 'COUNTDOWN',
  RACING = 'RACING',
  FINISHED = 'FINISHED'
}

export interface ImportData {
  names: string[];
}

export const RACER_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEEAD', // Cream
  '#D4A5A5', // Pink
  '#9B59B6', // Purple
  '#E67E22', // Orange
  '#ECF0F1', // White
];

export const RACER_ICONS: Record<RacerType, string> = {
  duck: '🦆',
  horse: '🐎',
  ostrich: '🐦',
  rabbit: '🐇',
  squirrel: '🐿️',
  bee: '🐝'
};

export const RACER_LABELS: Record<RacerType, string> = {
  duck: 'Vịt (Duck)',
  horse: 'Ngựa (Horse)',
  ostrich: 'Đà điểu (Ostrich)',
  rabbit: 'Thỏ (Rabbit)',
  squirrel: 'Sóc (Squirrel)',
  bee: 'Ong (Bee)'
};
