// src/app/pages/rounds/rounds.page.spec.ts
import { vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RoundsPage } from './rounds.page';
import { GameService } from '../../services/games';
import { RouterTestingModule } from '@angular/router/testing';

describe('RoundsPage', () => {
  let fixture: ComponentFixture<RoundsPage>;
  let component: RoundsPage;
  let mockGame: any;

  beforeEach(() => {
    mockGame = {
      players: [
        { id: 'p1', name: 'A' },
        { id: 'p2', name: 'B' },
      ],
      rounds: [
        { id: 'r1', scores: { p1: 1, p2: 2 } },
        { id: 'r2', scores: { p1: 3, p2: 4 } },
      ],
      addRound: vi.fn(),
      updateRoundScores: vi.fn(),
      removeRound: vi.fn(),
      resetRounds: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [RoundsPage, RouterTestingModule],
      providers: [{ provide: GameService, useValue: mockGame }],
    });

    fixture = TestBed.createComponent(RoundsPage);
    component = fixture.componentInstance;
  });

  it('addRound sollte GameService aufrufen und scores zurücksetzen', () => {
    component['scores'] = { p1: 5, p2: 6 };
    component.addRound();
    expect(mockGame.addRound).toHaveBeenCalledWith({ p1: 5, p2: 6 });
    expect(component['scores']).toEqual({});
  });

  it('toggleEdit sollte Edit-Buffer mit Rundendaten setzen', () => {
    component.toggleEdit('r1');
    expect(component['editingRoundId']).toBe('r1');
    expect(component['editBuffer']).toEqual({ p1: 1, p2: 2 });
  });

  it('toggleEdit auf gleiche Runde sollte Edit abbrechen', () => {
    component.toggleEdit('r1');
    component.toggleEdit('r1');
    expect(component['editingRoundId']).toBeNull();
    expect(component['editBuffer']).toEqual({});
  });

  it('saveEdit sollte sanitizen, Scores speichern und Edit zurücksetzen', () => {
    component['editingRoundId'] = 'r1';
    component['editBuffer'] = { p1: '10' as any, p2: Number.NaN as any };
    component.saveEdit('r1');
    expect(mockGame.updateRoundScores).toHaveBeenCalledWith('r1', { p1: 10, p2: 0 });
    expect(component['editingRoundId']).toBeNull();
    expect(component['editBuffer']).toEqual({});
  });

  it('saveEdit ohne editingRoundId sollte nichts tun', () => {
    component.saveEdit('r1');
    expect(mockGame.updateRoundScores).not.toHaveBeenCalled();
  });

  it('cancelEdit sollte Status und Buffer leeren', () => {
    component['editingRoundId'] = 'r1';
    component['editBuffer'] = { p1: 1 };
    component.cancelEdit();
    expect(component['editingRoundId']).toBeNull();
    expect(component['editBuffer']).toEqual({});
  });

  it('deleteRound sollte GameService aufrufen und Edit abbrechen, falls aktiv', () => {
    component['editingRoundId'] = 'r1';
    component['editBuffer'] = { p1: 1 };
    component.deleteRound('r1');
    expect(mockGame.removeRound).toHaveBeenCalledWith('r1');
    expect(component['editingRoundId']).toBeNull();
    expect(component['editBuffer']).toEqual({});
  });

  it('deleteRound ohne aktiven Edit sollte nur entfernen', () => {
    component.deleteRound('r2');
    expect(mockGame.removeRound).toHaveBeenCalledWith('r2');
  });

  it('clearRounds sollte GameService resetten und Edit abbrechen', () => {
    component['editingRoundId'] = 'r1';
    component['editBuffer'] = { p1: 1 };
    component.clearRounds();
    expect(mockGame.resetRounds).toHaveBeenCalled();
    expect(component['editingRoundId']).toBeNull();
    expect(component['editBuffer']).toEqual({});
  });

  it('partialTotals sollte kumulative Scores bis Index liefern', () => {
    const totals = component.partialTotals(1);
    expect(totals).toEqual({ p1: 4, p2: 6 }); // (1+3) und (2+4)
  });
});
