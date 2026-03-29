import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/games';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '../../components/card/card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import * as Sentry from '@sentry/angular';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, CardComponent, ButtonComponent, HeaderComponent, ConfirmDialogComponent, Sentry.TraceModule],
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.css'],
})
export class HistoryPage {
  protected readonly game = inject(GameService);
  protected confirmVisible = false;
  protected confirmTitle = '';
  protected confirmMessage = '';
  private pendingAction: (() => void) | null = null;

  formatDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  removeEntry(id: string) {
    this.confirmTitle = 'confirm.title';
    this.confirmMessage = 'confirm.deleteHistoryEntry';
    this.pendingAction = () => this.game.removeHistoryEntry(id);
    this.confirmVisible = true;
  }

  clearHistory() {
    this.confirmTitle = 'confirm.title';
    this.confirmMessage = 'confirm.clearHistory';
    this.pendingAction = () => this.game.clearHistory();
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
}

