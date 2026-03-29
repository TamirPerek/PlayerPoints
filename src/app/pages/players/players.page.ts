import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/games';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../components/button/button.component';
import { CardComponent} from '../../components/card/card.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import * as Sentry from "@sentry/angular";

@Component({
  selector: 'app-players-page',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, ButtonComponent, CardComponent, HeaderComponent, ConfirmDialogComponent, Sentry.TraceModule],
  templateUrl: 'players.page.html',
  styleUrls: ['players.page.css'],
})
export class PlayersPage {
  protected name = '';
  protected editingId: string | null = null;
  protected editName = '';
  protected readonly game = inject(GameService);
  protected confirmVisible = false;
  protected confirmTitle = '';
  protected confirmMessage = '';
  private pendingAction: (() => void) | null = null;
  private dragIndex: number | null = null;

  addPlayer() {
    this.game.addPlayer(this.name);
    this.name = '';
  }

  startEdit(player: { id: string; name: string }) {
    this.editingId = player.id;
    this.editName = player.name;
  }

  saveEdit(id: string) {
    this.game.updatePlayerName(id, this.editName);
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingId = null;
    this.editName = '';
  }

  remove(id: string) {
    const player = this.game.players.find((p) => p.id === id);
    this.confirmTitle = 'confirm.title';
    this.confirmMessage = `${player?.name ?? ''} entfernen?`;
    this.pendingAction = () => this.game.removePlayer(id);
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

  // Drag & Drop
  onDragStart(index: number) {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    if (this.dragIndex === null || this.dragIndex === targetIndex) return;
    const players = [...this.game.players];
    const [moved] = players.splice(this.dragIndex, 1);
    players.splice(targetIndex, 0, moved);
    this.game.reorderPlayers(players);
    this.dragIndex = null;
  }

  onDragEnd() {
    this.dragIndex = null;
  }
}
