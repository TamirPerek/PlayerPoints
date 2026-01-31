import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import * as Sentry from "@sentry/angular";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule, CommonModule, Sentry.TraceModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  lang: 'de' | 'en';
  theme: 'light' | 'dark';
  private readonly langKey = 'lang';
  private readonly themeKey = 'theme';
  get currentFlag() {
    return this.lang === 'de' ? '🇩🇪' : '🇬🇧';
  }
  constructor(private readonly translate: TranslateService) {
    this.lang = this.loadLang();
    this.theme = this.loadTheme();
    this.applyTheme(this.theme);
    this.translate.setDefaultLang(this.lang);
    this.translate.use(this.lang);
  }

  setLang(lang: 'de' | 'en') {
    this.lang = lang;
    this.translate.use(lang);
    this.persistLang(lang);
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.theme);
    this.persistTheme(this.theme);
  }

  private loadLang(): 'de' | 'en' {
    if (typeof localStorage === 'undefined') return 'de';
    const stored = localStorage.getItem(this.langKey);
    return stored === 'de' || stored === 'en' ? stored : 'de';
  }

  private loadTheme(): 'light' | 'dark' {
    if (typeof localStorage === 'undefined') return 'light';
    const stored = localStorage.getItem(this.themeKey);
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private persistLang(lang: 'de' | 'en') {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.langKey, lang);
  }

  private persistTheme(theme: 'light' | 'dark') {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.themeKey, theme);
  }

  private applyTheme(theme: 'light' | 'dark') {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
  }
}
