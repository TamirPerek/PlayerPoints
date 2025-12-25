import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameService } from '../../services/games';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: `./dashboard.page.html`,
  styleUrls: [`./dashboard.page.css`],
})
export class DashboardPage {
  private readonly game = inject(GameService);
  protected readonly playerCount = computed(() => this.game.players.length);
  protected readonly roundCount = computed(() => this.game.rounds.length);
}
