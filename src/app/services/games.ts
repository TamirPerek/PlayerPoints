import { Injectable } from '@angular/core';
import { Player } from '../models/player';
import { Round } from '../models/round';

@Injectable({ providedIn: 'root' })
export class GameService {
  players: Player[] = [];
  rounds: Round[] = [];
  private readonly storageKey = 'game';

  constructor() {
    this.load();
  }

  addPlayer(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    this.players = [...this.players, { id: crypto.randomUUID(), name: trimmed }];
    this.save();
  }

  removePlayer(id: string) {
    this.players = this.players.filter((p) => p.id !== id);
    this.rounds = this.rounds.map((round) => {
      const { [id]: _removed, ...rest } = round.scores;
      return { ...round, scores: rest };
    });
    this.save();
  }

  updatePlayerName(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    this.players = this.players.map((p) => (p.id === id ? { ...p, name: trimmed } : p));
    this.save();
  }

  addRound(scores: Record<string, number>) {
    if (!this.players.length) {
      return;
    }
    const sanitized: Record<string, number> = {};
    for (const player of this.players) {
      const raw = scores[player.id];
      const value = Number(raw);
      sanitized[player.id] = Number.isFinite(value) ? value : 0;
    }
    this.rounds = [...this.rounds, { id: crypto.randomUUID(), scores: sanitized }];
    this.save();
  }

  updateRoundScores(roundId: string, scores: Record<string, number>) {
    this.rounds = this.rounds.map((round) =>
      round.id === roundId ? { ...round, scores: { ...scores } } : round
    );
    this.save();
  }

  removeRound(roundId: string) {
    this.rounds = this.rounds.filter((round) => round.id !== roundId);
    this.save();
  }

  resetRounds() {
    this.rounds = [];
    this.save();
  }

  getTotalScore(playerId: string): number {
    return this.rounds.reduce(
      (sum, round) => sum + (round.scores[playerId] ?? 0),
      0
    );
  }

  getWinner(): { player: Player; score: number } | null {
    if (!this.players.length || !this.rounds.length) {
      return null;
    }
    return this.players.reduce<{
      player: Player;
      score: number;
    } | null>((current, player) => {
      const score = this.getTotalScore(player.id);
      if (!current || score < current.score) {
        return { player, score };
      }
      return current;
    }, null);
  }

  reset() {
    this.players = [];
    this.rounds = [];
    localStorage.removeItem(this.storageKey);
  }

  save() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({ players: this.players, rounds: this.rounds })
    );
  }

  load() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return;
    }
    try {
      const parsed = JSON.parse(data);
      this.players = Array.isArray(parsed.players) ? parsed.players : [];
      this.rounds = Array.isArray(parsed.rounds) ? parsed.rounds : [];
    } catch (error) {
      console.warn('Konnte gespeichertes Spiel nicht laden', error);
      this.players = [];
      this.rounds = [];
    }
  }
}
