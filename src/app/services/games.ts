import { Injectable } from '@angular/core';
import { Player, PLAYER_COLORS } from '../models/player';
import { Round } from '../models/round';
import { GameHistoryEntry } from '../models/game-history';
import * as Sentry from "@sentry/angular";

@Injectable({ providedIn: 'root' })
export class GameService {
  players: Player[] = [];
  rounds: Round[] = [];
  winMode: 'lowest' | 'highest' = 'lowest';
  history: GameHistoryEntry[] = [];
  private readonly storageKey = 'game';
  private readonly historyStorageKey = 'gameHistory';
  private undoStack: { players: Player[]; rounds: Round[]; winMode: 'lowest' | 'highest' }[] = [];
  private redoStack: { players: Player[]; rounds: Round[]; winMode: 'lowest' | 'highest' }[] = [];
  private static readonly MAX_UNDO = 50;

  get canUndo(): boolean { return this.undoStack.length > 0; }
  get canRedo(): boolean { return this.redoStack.length > 0; }

  constructor() {
    this.load();
    this.loadHistory();
  }

  private pushUndo() {
    this.undoStack.push({
      players: structuredClone(this.players),
      rounds: structuredClone(this.rounds),
      winMode: this.winMode,
    });
    if (this.undoStack.length > GameService.MAX_UNDO) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo() {
    const state = this.undoStack.pop();
    if (!state) return;
    this.redoStack.push({
      players: structuredClone(this.players),
      rounds: structuredClone(this.rounds),
      winMode: this.winMode,
    });
    this.players = state.players;
    this.rounds = state.rounds;
    this.winMode = state.winMode;
    this.save();
  }

  redo() {
    const state = this.redoStack.pop();
    if (!state) return;
    this.undoStack.push({
      players: structuredClone(this.players),
      rounds: structuredClone(this.rounds),
      winMode: this.winMode,
    });
    this.players = state.players;
    this.rounds = state.rounds;
    this.winMode = state.winMode;
    this.save();
  }

  toggleWinMode() {
    this.pushUndo();
    this.winMode = this.winMode === 'lowest' ? 'highest' : 'lowest';
    this.save();
  }

  addPlayer(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    this.pushUndo();
    const color = PLAYER_COLORS[this.players.length % PLAYER_COLORS.length];
    this.players = [...this.players, { id: crypto.randomUUID(), name: trimmed, color }];
    this.save();
  }

  removePlayer(id: string) {
    this.pushUndo();
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
    this.pushUndo();
    this.players = this.players.map((p) => (p.id === id ? { ...p, name: trimmed } : p));
    this.save();
  }

  reorderPlayers(players: Player[]) {
    this.pushUndo();
    this.players = [...players];
    this.save();
  }

  addRound(scores: Record<string, number>) {
    if (!this.players.length) {
      return;
    }
    this.pushUndo();
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
    this.pushUndo();
    this.rounds = this.rounds.map((round) =>
      round.id === roundId ? { ...round, scores: { ...scores } } : round
    );
    this.save();
  }

  removeRound(roundId: string) {
    this.pushUndo();
    this.rounds = this.rounds.filter((round) => round.id !== roundId);
    this.save();
  }

  resetRounds() {
    this.pushUndo();
    this.saveToHistory();
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
    const isLowest = this.winMode === 'lowest';
    return this.players.reduce<{
      player: Player;
      score: number;
    } | null>((current, player) => {
      const score = this.getTotalScore(player.id);
      if (!current || (isLowest ? score < current.score : score > current.score)) {
        return { player, score };
      }
      return current;
    }, null);
  }

  reset() {
    this.saveToHistory();
    this.players = [];
    this.rounds = [];
    localStorage.removeItem(this.storageKey);
  }

  save() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({ players: this.players, rounds: this.rounds, winMode: this.winMode })
    );
  }

  load() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return;
    }
    try {
      const parsed = JSON.parse(data);
      this.players = Array.isArray(parsed.players)
        ? parsed.players.map((p: any, i: number) => ({
            ...p,
            color: p.color || PLAYER_COLORS[i % PLAYER_COLORS.length],
          }))
        : [];
      this.rounds = Array.isArray(parsed.rounds) ? parsed.rounds : [];
      this.winMode = parsed.winMode === 'highest' ? 'highest' : 'lowest';
    } catch (error) {
      console.warn('Konnte gespeichertes Spiel nicht laden', error);
      Sentry.captureException(error);
      this.players = [];
      this.rounds = [];
    }
  }

  // --- History ---

  saveToHistory() {
    if (!this.rounds.length || !this.players.length) return;
    const winner = this.getWinner();
    const entry: GameHistoryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      players: [...this.players],
      rounds: [...this.rounds],
      winMode: this.winMode,
      winner: winner ? { name: winner.player.name, score: winner.score } : null,
    };
    this.history = [...this.history, entry];
    this.saveHistory();
  }

  removeHistoryEntry(id: string) {
    this.history = this.history.filter((e) => e.id !== id);
    this.saveHistory();
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem(this.historyStorageKey);
  }

  private saveHistory() {
    localStorage.setItem(this.historyStorageKey, JSON.stringify(this.history));
  }

  private loadHistory() {
    const data = localStorage.getItem(this.historyStorageKey);
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      this.history = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Konnte Spielhistorie nicht laden', error);
      Sentry.captureException(error);
      this.history = [];
    }
  }
}
