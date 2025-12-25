import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ResultsPage } from './results.page';
import { GameService } from '../../services/games';
import { vi } from 'vitest';

describe('ResultsPage', () => {
  let fixture: ComponentFixture<ResultsPage>;
  let component: ResultsPage;
  let mockGame: any;

  beforeEach(() => {
    mockGame = {
      players: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ],
      rounds: [],
      getTotalScore: vi.fn((id: string) => (id === 'p1' ? 3 : 5)),
      getWinner: vi.fn(() => ({ player: { id: 'p1', name: 'Alice' }, score: 3 })),
      reset: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ResultsPage, RouterTestingModule],
      providers: [{ provide: GameService, useValue: mockGame }],
    });

    fixture = TestBed.createComponent(ResultsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('totals should build map from getTotalScore', () => {
    const totals = component['totals']();
    expect(mockGame.getTotalScore).toHaveBeenCalledWith('p1');
    expect(mockGame.getTotalScore).toHaveBeenCalledWith('p2');
    expect(totals).toEqual({ p1: 3, p2: 5 });
  });

  it('sortedPlayers should sort ascending by total score', () => {
    const sorted = component['sortedPlayers']();
    expect(sorted.map((p: any) => p.id)).toEqual(['p1', 'p2']);
  });

  it('winner should delegate to game service', () => {
    const winner = component['winner']();
    expect(mockGame.getWinner).toHaveBeenCalled();
    expect(winner).toEqual({ player: { id: 'p1', name: 'Alice' }, score: 3 });
  });

  it('reset should delegate to game service', () => {
    component.reset();
    expect(mockGame.reset).toHaveBeenCalled();
  });
});

