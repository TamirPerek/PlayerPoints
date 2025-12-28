import { Component, computed, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/games';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '../../components/card/card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { HeaderComponent} from '../../components/header/header.component';
import * as Sentry from "@sentry/angular";

declare const confetti: (opts?: any) => void;

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, CardComponent, ButtonComponent, HeaderComponent, Sentry.TraceModule],
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.css'],
})
export class ResultsPage implements AfterViewInit {
  protected firstOf: boolean = true;
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

  randomInRange(min:number, max:number) : number {
    return Math.random() * (max - min) + min;
  }

  ngAfterViewInit() {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval = setInterval( () => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: this.randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: this.randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }
}
