import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/games';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../components/button/button.component';
import { CardComponent} from '../../components/card/card.component';

@Component({
  selector: 'app-players-page',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, TranslateModule, ButtonComponent, CardComponent],
  templateUrl: 'players.page.html',
  styleUrls: ['players.page.css'],
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
