import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardPage } from './dashboard.page';
import { GameService } from '../../services/games';
import { vi } from 'vitest';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let component: DashboardPage;
  let mockGame: any;

  beforeEach(() => {
    mockGame = {
      players: [{ id: 'p1', name: 'A' }],
      rounds: [{ id: 'r1', scores: { p1: 1 } }],
    };

    TestBed.configureTestingModule({
      imports: [DashboardPage, RouterTestingModule],
      providers: [{ provide: GameService, useValue: mockGame }],
    });

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('playerCount should equal GameService players length on creation', () => {
    expect(component['playerCount']()).toBe(mockGame.players.length);
  });

  it('roundCount should equal GameService rounds length on creation', () => {
    expect(component['roundCount']()).toBe(mockGame.rounds.length);
  });
});
