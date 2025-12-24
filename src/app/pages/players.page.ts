import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/games';

@Component({
  selector: 'app-players-page',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <h1>Spieler</h1>
          <p>Lege Spieler an oder entferne sie.</p>
        </div>
        <a routerLink="/" class="link">Zurück</a>
      </header>

      <form class="card" (ngSubmit)="addPlayer()">
        <label class="field">
          <span>Name</span>
          <input type="text" [(ngModel)]="name" name="playerName" required />
        </label>
        <button type="submit">Hinzufügen</button>
      </form>

      <section class="list card" *ngIf="game.players.length; else empty">
        <div class="list-row" *ngFor="let player of game.players">
          <div class="row-content" *ngIf="editingId !== player.id; else editRow">
            <strong>{{ player.name }}</strong>
          </div>
          <ng-template #editRow>
            <label class="field inline">
              <input
                type="text"
                [(ngModel)]="editName"
                name="editName-{{ player.id }}"
                required
              />
            </label>
          </ng-template>
          <div class="row-actions">
            <button *ngIf="editingId !== player.id" type="button" class="secondary" (click)="startEdit(player)">
              Bearbeiten
            </button>
            <button *ngIf="editingId !== player.id" type="button" (click)="remove(player.id)">
              Entfernen
            </button>
            <button *ngIf="editingId === player.id" type="button" (click)="saveEdit(player.id)">
              Speichern
            </button>
            <button *ngIf="editingId === player.id" type="button" class="secondary" (click)="cancelEdit()">
              Abbrechen
            </button>
          </div>
        </div>
      </section>
      <ng-template #empty>
        <div class="card muted">Noch keine Spieler angelegt.</div>
      </ng-template>
    </main>
  `,
  styles: [
    `
      .page { padding: 1.25rem; max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
      .page-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
      .link { text-decoration: none; color: #2563eb; font-weight: 500; }
      .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; background: #fff; }
      .muted { color: #6b7280; }
      form { display: grid; gap: 0.75rem; }
      .field { display: grid; gap: 0.35rem; }
      input { padding: 0.6rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
      button { align-self: start; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid #2563eb; background: #2563eb; color: #fff; cursor: pointer; font-weight: 600; }
      .list { display: grid; gap: 0.5rem; }
      .list-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
      .list-row:last-child { border-bottom: none; }
      .row-content { flex: 1; min-width: 0; }
      .row-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
      .secondary { background: #fff; color: #2563eb; border-color: #cbd5e1; }
      .inline input { width: 100%; }

      @media (max-width: 640px) {
        .page { padding: 1rem; gap: 0.85rem; }
        button { width: 100%; text-align: center; }
        .page-header { justify-content: space-between; }
        .row-actions { width: 100%; }
        .row-actions button { flex: 1 1 48%; }
      }
      @media (prefers-color-scheme: dark) {
        .card {
          background: #0b1221;
        }
        .secondary { background: transparent; color: #60a5fa; border-color: #1f2937; }
      }
    `,
  ],
})
export class PlayersPage {
  protected name = '';
  protected editingId: string | null = null;
  protected editName = '';
  protected readonly game = inject(GameService);

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
    this.game.removePlayer(id);
  }
}
