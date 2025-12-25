import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayersPage } from './players.page';
import { GameService } from '../../services/games';
import { vi } from 'vitest';

describe('PlayersPage', () => {
  let fixture: ComponentFixture<PlayersPage>;
  let component: PlayersPage;
  let mockGame: any;

  beforeEach(() => {
    mockGame = {
      players: [{ id: 'p1', name: 'Alice' }],
      rounds: [],
      addPlayer: vi.fn(),
      updatePlayerName: vi.fn(),
      removePlayer: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [PlayersPage, RouterTestingModule],
      providers: [{ provide: GameService, useValue: mockGame }],
    });

    fixture = TestBed.createComponent(PlayersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('addPlayer should delegate to GameService and reset name', () => {
    component['name'] = ' Bob ';
    component.addPlayer();
    expect(mockGame.addPlayer).toHaveBeenCalledWith(' Bob ');
    expect(component['name']).toBe('');
  });

  it('startEdit should set editing state and name buffer', () => {
    const player = { id: 'p1', name: 'Alice' };
    component.startEdit(player);
    expect(component['editingId']).toBe('p1');
    expect(component['editName']).toBe('Alice');
  });

  it('saveEdit should update name and clear edit state', () => {
    component['editingId'] = 'p1';
    component['editName'] = 'New';
    component.saveEdit('p1');
    expect(mockGame.updatePlayerName).toHaveBeenCalledWith('p1', 'New');
    expect(component['editingId']).toBeNull();
    expect(component['editName']).toBe('');
  });

  it('cancelEdit should clear edit state', () => {
    component['editingId'] = 'p1';
    component['editName'] = 'Temp';
    component.cancelEdit();
    expect(component['editingId']).toBeNull();
    expect(component['editName']).toBe('');
  });

  it('remove should delegate to GameService', () => {
    component.remove('p1');
    expect(mockGame.removePlayer).toHaveBeenCalledWith('p1');
  });
});

