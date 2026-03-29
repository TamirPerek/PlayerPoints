import {Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/games';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent} from '../../components/card/card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import * as Sentry from "@sentry/angular";
import {Router} from '@angular/router';

@Component({
  selector: 'app-rounds-page',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, CardComponent, ButtonComponent, HeaderComponent, ConfirmDialogComponent, Sentry.TraceModule],
  templateUrl: './rounds.page.html',
  styleUrls: ['./rounds.page.css'],
})

export class RoundsPage {
  protected scores: Record<string, number> = {};
  protected editingRoundId: string | null = null;
  protected editBuffer: Record<string, number> = {};
  protected readonly game = inject(GameService);
  private readonly router = inject(Router);
  protected confirmVisible = false;
  protected confirmTitle = '';
  protected confirmMessage = '';
  private pendingAction: (() => void) | null = null;
  protected readonly presetValues = [0, 5, 10, 15, 20, 25, 50];

  increment(playerId: string) {
    this.scores[playerId] = (this.scores[playerId] ?? 0) + 1;
  }

  decrement(playerId: string) {
    this.scores[playerId] = (this.scores[playerId] ?? 0) - 1;
  }

  setScore(playerId: string, value: number) {
    this.scores[playerId] = value;
  }

  addRound() {
    this.game.addRound(this.scores);
    this.scores = {};
  }
  totals(): Record<string, number> {
    const map: Record<string, number> = {};
    for (const player of this.game.players) {
      map[player.id] = this.game.getTotalScore(player.id);
    }
    return map;
  }

  sortedPlayers() {
    const dir = this.game.winMode === 'lowest' ? 1 : -1;
    return [...this.game.players].sort((a, b) => dir * ((this.totals()[a.id] ?? 0) - (this.totals()[b.id] ?? 0)));
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
    this.confirmTitle = 'confirm.title';
    this.confirmMessage = 'confirm.deleteRound';
    this.pendingAction = () => {
      this.game.removeRound(roundId);
      if (this.editingRoundId === roundId) {
        this.cancelEdit();
      }
    };
    this.confirmVisible = true;
  }

  clearRounds() {
    this.confirmTitle = 'confirm.title';
    this.confirmMessage = 'confirm.deleteRounds';
    this.pendingAction = () => {
      this.game.resetRounds();
      this.cancelEdit();
    };
    this.confirmVisible = true;
  }

  onConfirm() {
    this.pendingAction?.();
    this.closeConfirm();
  }

  closeConfirm() {
    this.confirmVisible = false;
    this.pendingAction = null;
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

  finalizeGame(): void {
    this.router.navigate(['/results']);
  }
}
