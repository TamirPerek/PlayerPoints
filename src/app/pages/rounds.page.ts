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
              inputmode="decimal"
              pattern="[0-9]*"
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
            <div class="round-header">Runde {{ i + 1 }}</div>
            <div class="round-scores">
              <div *ngFor="let player of game.players">
                <strong>{{ player.name }}: </strong>
                <span>{{ round.scores[player.id] ?? 0 }}</span>
              </div>
            </div>
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
      .round-header { font-weight: 600; margin-bottom: 0.35rem; }
      .round-scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.35rem; }

      @media (max-width: 640px) {
        .page { padding: 1rem; gap: 0.85rem; }
        button { width: 100%; text-align: center; }
        .page-header { justify-content: space-between; }
      }

      @media (prefers-color-scheme: dark) {
        .card {
          background: #0b1221;
        }
        .round {
          background: #0b1221;
        }
      }
    `,
  ],
})
export class RoundsPage {
  protected scores: Record<string, number> = {};
  protected readonly game = inject(GameService);

  addRound() {
    this.game.addRound(this.scores);
    this.scores = {};
  }
}
