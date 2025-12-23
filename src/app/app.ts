import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="shell">
      <nav class="topbar">
        <a routerLink="/">PlayerPoints</a>
        <div class="links">
          <a routerLink="/players">Spieler</a>
          <a routerLink="/rounds">Runden</a>
          <a routerLink="/results">Ergebnis</a>
        </div>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.css'],
})
export class App {}
