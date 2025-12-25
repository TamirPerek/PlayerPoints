import { TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
          defaultLanguage: 'de',
        }),
      ],
      providers: [provideRouter(routes)],
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', { 'app.title': 'PlayerPoints' });
    translate.use('de');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render navigation', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navText = compiled.querySelector('.topbar a')?.textContent?.trim() ?? '';
    expect(navText).toBe('PlayerPoints');
  });
});
