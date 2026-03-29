import { Player } from './player';
import { Round } from './round';

export interface GameHistoryEntry {
  id: string;
  date: string;
  players: Player[];
  rounds: Round[];
  winMode: 'lowest' | 'highest';
  winner: { name: string; score: number } | null;
}

