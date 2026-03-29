import { Component, computed, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/games';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '../../components/card/card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { HeaderComponent} from '../../components/header/header.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ScoreChartComponent } from '../../components/score-chart/score-chart.component';
import * as Sentry from "@sentry/angular";
import confetti from 'canvas-confetti';
import { Router } from '@angular/router';

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, CardComponent, ButtonComponent, HeaderComponent, ConfirmDialogComponent, ScoreChartComponent, Sentry.TraceModule],
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.css'],
})
export class ResultsPage implements AfterViewInit {
  protected readonly game = inject(GameService);
  private readonly router = inject(Router);
  protected readonly totals = computed(() => {
    const map: Record<string, number> = {};
    for (const player of this.game.players) {
      map[player.id] = this.game.getTotalScore(player.id);
    }
    return map;
  });
  protected readonly sortedPlayers = computed(() => {
    const dir = this.game.winMode === 'lowest' ? 1 : -1;
    return [...this.game.players].sort((a, b) => dir * ((this.totals()[a.id] ?? 0) - (this.totals()[b.id] ?? 0)));
  });
  protected readonly winner = computed(() => this.game.getWinner());
  protected confirmVisible = false;
  protected confirmTitle = '';
  protected confirmMessage = '';
  private pendingAction: (() => void) | null = null;

  reset() {
    this.confirmTitle = 'confirm.title';
    this.confirmMessage = 'confirm.newGame';
    this.pendingAction = () => this.game.reset();
    this.confirmVisible = true;
  }

  resetKeepPlayers() {
    this.confirmTitle = 'confirm.title';
    this.confirmMessage = 'confirm.newGameKeepPlayers';
    this.pendingAction = () => {
      this.game.resetRounds();
      this.router.navigate(['/rounds']);
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

  async shareResults() {
    const players = this.sortedPlayers();
    const t = this.totals();
    const lines = players.map((p, i) => `${i + 1}. ${p.name}: ${t[p.id]} Punkte`);
    const w = this.winner();
    if (w) {
      lines.push('', `🏆 ${w.player.name} gewinnt mit ${w.score} Punkten!`);
    }
    const text = `🎮 PlayerPoints Ergebnis\n\n${lines.join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'PlayerPoints', text });
      } catch { /* User cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      this.showCopiedHint = true;
      setTimeout(() => this.showCopiedHint = false, 2000);
    }
  }

  protected showCopiedHint = false;

  randomInRange(min:number, max:number) : number {
    return Math.random() * (max - min) + min;
  }

  ngAfterViewInit() {
    Sentry.startSpan({ name: 'ResultsPage Confetti Animation' }, () => {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults: confetti.Options = { startVelocity: 10, spread: 360, ticks: 60, zIndex: 0 , shapes: ["star"], colors: ["#af9904"]};

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
    });

  }
}
