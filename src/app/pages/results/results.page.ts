import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/games';

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.css'],
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
