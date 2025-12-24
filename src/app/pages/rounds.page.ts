import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/games';

@Component({
  selector: 'app-rounds-page',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <h1>Runden</h1>
          <p>Punkte je Runde erfassen.</p>
        </div>
        <a routerLink="/" class="link">Zurück</a>
      </header>

      <section class="card" *ngIf="game.players.length; else noPlayers">
        <form class="round-form" (ngSubmit)="addRound()">
          <div class="field" *ngFor="let player of game.players">
            <label [for]="player.id">{{ player.name }}</label>
            <input
              type="number"
              inputmode="text"
              pattern="-?[0-9]+"
              [id]="player.id"
              [(ngModel)]="scores[player.id]"
              name="score-{{ player.id }}"
              required
            />
          </div>
          <button type="submit">Runde hinzufügen</button>
        </form>
      </section>
      <ng-template #noPlayers>
        <div class="card muted">Lege zuerst Spieler an.</div>
      </ng-template>

      <section class="card" *ngIf="game.rounds.length">
        <h2>Erfasste Runden</h2>
        <div class="round-list">
          <div class="round" *ngFor="let round of game.rounds; index as i">
            <div class="round-header">
              <span>Runde {{ i + 1 }}</span>
              <div class="round-actions">
                <button class="link-btn" type="button" (click)="toggleEdit(round.id)">
                  {{ editingRoundId === round.id ? 'Abbrechen' : 'Bearbeiten' }}
                </button>
                <button class="link-btn danger" type="button" (click)="deleteRound(round.id)">
                  Löschen
                </button>
              </div>
            </div>

            <div class="round-scores" *ngIf="editingRoundId !== round.id">
              <div *ngFor="let player of game.players">
                <strong>{{ player.name }}: </strong>
                <span>{{ round.scores[player.id] ?? 0 }}</span>
              </div>
            </div>

            <div class="round-totals" *ngIf="editingRoundId !== round.id">
              <div class="round-totals-title">Zwischenstand nach Runde {{ i + 1 }}</div>
              <div class="round-scores">
                <div *ngFor="let player of game.players">
                  <strong>{{ player.name }}: </strong>
                  <span>{{ partialTotals(i)[player.id] }}</span>
                </div>
              </div>
            </div>

            <form
              *ngIf="editingRoundId === round.id"
              class="edit-form"
              (ngSubmit)="saveEdit(round.id)"
            >
              <div class="edit-grid">
                <div class="field" *ngFor="let player of game.players">
                  <label [for]="'edit-' + round.id + '-' + player.id">{{ player.name }}</label>
                  <input
                    type="number"
                    inputmode="text"
                    pattern="-?[0-9]*"
                    [id]="'edit-' + round.id + '-' + player.id"
                    [(ngModel)]="editBuffer[player.id]"
                    name="edit-{{ round.id }}-{{ player.id }}"
                    required
                  />
                </div>
              </div>
              <div class="edit-actions">
                <button type="submit">Speichern</button>
                <button type="button" class="secondary" (click)="cancelEdit()">Abbrechen</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      .page { padding: 1.25rem; max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
      .page-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
      .link { text-decoration: none; color: #2563eb; font-weight: 500; }
      .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; background: #fff; }
      .muted { color: #6b7280; }
      .round-form { display: grid; gap: 0.75rem; }
      .field { display: grid; gap: 0.35rem; }
      label { font-weight: 500; }
      input { padding: 0.6rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
      button { align-self: start; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid #2563eb; background: #2563eb; color: #fff; cursor: pointer; font-weight: 600; }
      .round-list { display: grid; gap: 0.75rem; margin-top: 0.5rem; }
      .round { border: 1px solid #f1f5f9; border-radius: 8px; padding: 0.75rem; background: #f8fafc; }
      .round-header { display: flex; align-items: center; justify-content: space-between; font-weight: 600; margin-bottom: 0.35rem; gap: 0.5rem; }
      .round-actions { display: flex; gap: 0.5rem; align-items: center; }
      .link-btn { background: none; border: none; color: #2563eb; font-weight: 600; cursor: pointer; padding: 0; }
      .danger { color: #b91c1c; }
      .round-scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.35rem; }
      .edit-form { display: grid; gap: 0.75rem; }
      .edit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.6rem; }
      .edit-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
      .secondary { background: #fff; color: #2563eb; border-color: #cbd5e1; }
      .round-totals { margin-top: 0.5rem; border-top: 1px dashed #e5e7eb; padding-top: 0.5rem; display: grid; gap: 0.35rem; }
      .round-totals-title { font-weight: 600; color: #475569; }

      @media (max-width: 640px) {
        .page { padding: 1rem; gap: 0.85rem; }
        button { width: 100%; text-align: center; }
        .page-header { justify-content: space-between; }
        .edit-actions { flex-direction: column; }
        .edit-actions button { width: 100%; }
      }

      @media (prefers-color-scheme: dark) {
        .card {
          background: #0b1221;
          border-color: #1f2937;
        }
        .round {
          background: #0b1221;
          border-color: #1f2937;
        }
        input { background: #111827; color: #e5e7eb; border-color: #374151; }
        .link { color: #60a5fa; }
        .link-btn { color: #60a5fa; }
        button { background: #2563eb; border-color: #1d4ed8; }
        .secondary { background: transparent; color: #cbd5e1; border-color: #374151; }
        .danger { color: #fca5a5; }
        .round-totals { border-color: #1f2937; }
        .round-totals-title { color: #cbd5e1; }
      }
    `,
  ],
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
