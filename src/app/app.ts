import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule, CommonModule],
  template: `
    <div class="shell">
      <nav class="topbar">
        <a routerLink="/">{{ 'app.title' | translate }}</a>
        <div class="lang-dropdown">
          <button class="lang-trigger" type="button">
            <span class="flag">{{ currentFlag }}</span>
            <span class="code">{{ lang.toUpperCase() }}</span>
            <span aria-hidden="true">▾</span>
          </button>
          <div class="lang-menu">
            <button type="button" (click)="setLang('de')">
              <span class="flag">🇩🇪</span><span>Deutsch</span>
            </button>
            <button type="button" (click)="setLang('en')">
              <span class="flag">🇬🇧</span><span>English</span>
            </button>
          </div>
        </div>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  lang = 'de';
  get currentFlag() {
    return this.lang === 'de' ? '🇩🇪' : '🇬🇧';
  }
  constructor(private readonly translate: TranslateService) {
    this.translate.setDefaultLang('de');
    this.translate.use(this.lang);
  }

  setLang(lang: 'de' | 'en') {
    this.lang = lang;
    this.translate.use(lang);
  }
}
