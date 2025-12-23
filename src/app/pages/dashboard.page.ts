import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameService } from '../services/games';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page">
      <header>
        <h1>PlayerPoints</h1>
        <p>Verwalte Spieler, erfasse Rundenpunkte und sieh das Ergebnis.</p>
      </header>

      <section class="cards">
        <a routerLink="/players" class="card">
          <h2>Spieler</h2>
          <p>{{ playerCount() }} Spieler angelegt</p>
        </a>
        <a routerLink="/rounds" class="card" [class.disabled]="!playerCount()">
          <h2>Runden</h2>
          <p>{{ roundCount() }} Runden erfasst</p>
        </a>
        <a routerLink="/results" class="card" [class.disabled]="!roundCount()">
          <h2>Ergebnis</h2>
          <p>Aktuellen Sieger ansehen</p>
        </a>
      </section>
    </main>
  `,
  styles: [
    `
      .page { padding: 1.25rem; max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }
      header p { margin-top: 0.25rem; color: #4b5563; }
      .cards { display: grid; gap: 0.85rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
      .card { display: block; padding: 1rem; border-radius: 12px; border: 1px solid #e5e7eb; text-decoration: none; color: inherit; background: #fff; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
      .card:hover { border-color: #cbd5e1; box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08); transform: translateY(-1px); }
      .card.disabled { opacity: 0.5; pointer-events: none; }

      @media (max-width: 640px) {
        .page { padding: 1rem; gap: 1rem; }
        .card { padding: 0.9rem; }
      }

      @media (prefers-color-scheme: dark) {
        .card {
          background: #0b1221;
        }
      }
    `,
  ],
})
export class DashboardPage {
  private readonly game = inject(GameService);
  protected readonly playerCount = computed(() => this.game.players.length);
  protected readonly roundCount = computed(() => this.game.rounds.length);
}
