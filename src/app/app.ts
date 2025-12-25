import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule, CommonModule],
  templateUrl: './app.html',
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
