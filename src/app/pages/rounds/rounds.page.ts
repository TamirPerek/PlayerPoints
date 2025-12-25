import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/games';

@Component({
  selector: 'app-rounds-page',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './rounds.page.html',
  styleUrls: ['./rounds.page.css'],
})

export class RoundsPage {
  protected scores: Record<string, number> = {};
  protected editingRoundId: string | null = null;
  protected editBuffer: Record<string, number> = {};
  protected readonly game = inject(GameService);

  addRound() {
    this.game.addRound(this.scores);
    this.scores = {};
  }

  toggleEdit(roundId: string) {
    if (this.editingRoundId === roundId) {
      this.cancelEdit();
      return;
    }
    this.editingRoundId = roundId;
    const round = this.game.rounds.find((r) => r.id === roundId);
    this.editBuffer = round
      ? Object.fromEntries(
          this.game.players.map((player) => [player.id, round.scores[player.id] ?? 0])
        )
      : {};
  }

  saveEdit(roundId: string) {
    if (!this.editingRoundId) return;
    // sanitize like addRound
    const sanitized: Record<string, number> = {};
    for (const player of this.game.players) {
      const raw = this.editBuffer[player.id];
      const value = Number(raw);
      sanitized[player.id] = Number.isFinite(value) ? value : 0;
    }
    this.game.updateRoundScores(roundId, sanitized);
    this.editingRoundId = null;
    this.editBuffer = {};
  }

  cancelEdit() {
    this.editingRoundId = null;
    this.editBuffer = {};
  }

  deleteRound(roundId: string) {
    this.game.removeRound(roundId);
    if (this.editingRoundId === roundId) {
      this.cancelEdit();
    }
  }

  clearRounds() {
    this.game.resetRounds();
    this.cancelEdit();
  }

  partialTotals(index: number): Record<string, number> {
    const totals: Record<string, number> = Object.fromEntries(
      this.game.players.map((p) => [p.id, 0])
    );
    for (let i = 0; i <= index; i++) {
      const round = this.game.rounds[i];
      if (!round) continue;
      for (const player of this.game.players) {
        totals[player.id] += round.scores[player.id] ?? 0;
      }
    }
    return totals;
  }
}
