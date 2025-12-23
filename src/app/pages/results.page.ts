import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/games';

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <h1>Ergebnis</h1>
          <p>Summen und Sieger.</p>
        </div>
        <a routerLink="/" class="link">Zurück</a>
      </header>

      <section class="card" *ngIf="game.players.length; else empty">
        <h2>Scoreboard</h2>
        <div class="scores">
          <div class="score-row" *ngFor="let player of sortedPlayers()">
            <div>
              <strong>{{ player.name }}</strong>
            </div>
            <div class="score-value">{{ totals()[player.id] }}</div>
          </div>
        </div>
        <div class="winner" *ngIf="winner() as w">
          <p>Sieger: <strong>{{ w.player.name }}</strong> mit {{ w.score }} Punkten</p>
        </div>
        <button type="button" (click)="reset()">Neues Spiel</button>
      </section>
      <ng-template #empty>
        <div class="card muted">Keine Spieler/Runden vorhanden.</div>
      </ng-template>
    </main>
  `,
  styles: [
    `
      .page { padding: 1.25rem; max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
      .page-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
      .link { text-decoration: none; color: #2563eb; font-weight: 500; }
      .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; background: #fff; display: grid; gap: 0.75rem; }
      .muted { color: #6b7280; }
      .scores { display: grid; gap: 0.5rem; }
      .score-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 0.35rem 0; gap: 0.5rem; }
      .score-row:last-child { border-bottom: none; }
      .score-value { font-weight: 600; }
      .winner { padding-top: 0.5rem; color: #0f172a; }
      button { width: fit-content; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid #ef4444; background: #ef4444; color: #fff; cursor: pointer; font-weight: 600; }

      @media (max-width: 640px) {
        .page { padding: 1rem; gap: 0.85rem; }
        button { width: 100%; text-align: center; }
        .page-header { justify-content: space-between; }
      }

      @media (prefers-color-scheme: dark) {
        .card {
          background: var(--surface);
        }
        .winner { color: #ffffff; }
      }
    `,
  ],
})
export class ResultsPage {
  protected readonly game = inject(GameService);
  protected readonly totals = computed(() => {
    const map: Record<string, number> = {};
    for (const player of this.game.players) {
      map[player.id] = this.game.getTotalScore(player.id);
    }
    return map;
  });
  protected readonly sortedPlayers = computed(() =>
    // Niedrigste Punktzahl gewinnt
    [...this.game.players].sort((a, b) => (this.totals()[a.id] ?? 0) - (this.totals()[b.id] ?? 0))
  );
  protected readonly winner = computed(() => this.game.getWinner());

  reset() {
    this.game.reset();
  }
}
