export interface Round {
  id: string;
  scores: Record<string, number | undefined>; // playerId → Punkte, optional when removed
}
