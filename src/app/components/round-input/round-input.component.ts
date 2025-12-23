import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/games';

@Component({
  selector: 'app-round-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './round-input.component.html',
})
export class RoundInputComponent {
  protected scores: Record<string, number> = {};
  protected readonly game = inject(GameService);

  submit() {
    this.game.addRound(this.scores);
    this.scores = {};
  }
}
