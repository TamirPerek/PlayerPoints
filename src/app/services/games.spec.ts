import { TestBed } from '@angular/core/testing';
import { GameService } from './games';

describe('GameService', () => {
  let service: GameService;
  const mockStorage = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      configurable: true,
    });
    mockStorage.clear();
    TestBed.configureTestingModule({
      providers: [GameService],
    });
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- addPlayer ---
  describe('addPlayer', () => {
    it('should add a player with trimmed name and a color', () => {
      service.addPlayer('  Alice  ');
      expect(service.players).toHaveLength(1);
      expect(service.players[0].name).toBe('Alice');
      expect(service.players[0].color).toBeTruthy();
      expect(service.players[0].id).toBeTruthy();
    });

    it('should not add a player with empty name', () => {
      service.addPlayer('   ');
      expect(service.players).toHaveLength(0);
    });

    it('should assign different colors to different players', () => {
      service.addPlayer('A');
      service.addPlayer('B');
      expect(service.players[0].color).not.toBe(service.players[1].color);
    });
  });

  // --- removePlayer ---
  describe('removePlayer', () => {
    it('should remove the player and clean up round scores', () => {
      service.addPlayer('A');
      service.addPlayer('B');
      const idA = service.players[0].id;
      const idB = service.players[1].id;
      service.addRound({ [idA]: 5, [idB]: 10 });
      service.removePlayer(idA);
      expect(service.players).toHaveLength(1);
      expect(service.players[0].id).toBe(idB);
      expect(service.rounds[0].scores[idA]).toBeUndefined();
      expect(service.rounds[0].scores[idB]).toBe(10);
    });
  });

  // --- updatePlayerName ---
  describe('updatePlayerName', () => {
    it('should update the name of a player', () => {
      service.addPlayer('Old');
      const id = service.players[0].id;
      service.updatePlayerName(id, '  New  ');
      expect(service.players[0].name).toBe('New');
    });

    it('should not update with empty name', () => {
      service.addPlayer('Keep');
      const id = service.players[0].id;
      service.updatePlayerName(id, '  ');
      expect(service.players[0].name).toBe('Keep');
    });
  });

  // --- reorderPlayers ---
  describe('reorderPlayers', () => {
    it('should set the players to the new order', () => {
      service.addPlayer('A');
      service.addPlayer('B');
      const reversed = [...service.players].reverse();
      service.reorderPlayers(reversed);
      expect(service.players[0].name).toBe('B');
      expect(service.players[1].name).toBe('A');
    });
  });

  // --- addRound ---
  describe('addRound', () => {
    it('should add a round with sanitized scores', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 7 });
      expect(service.rounds).toHaveLength(1);
      expect(service.rounds[0].scores[id]).toBe(7);
    });

    it('should replace non-finite scores with 0', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: NaN });
      expect(service.rounds[0].scores[id]).toBe(0);
    });

    it('should not add a round when there are no players', () => {
      service.addRound({ x: 5 });
      expect(service.rounds).toHaveLength(0);
    });
  });

  // --- updateRoundScores ---
  describe('updateRoundScores', () => {
    it('should update scores of an existing round', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 1 });
      const roundId = service.rounds[0].id;
      service.updateRoundScores(roundId, { [id]: 99 });
      expect(service.rounds[0].scores[id]).toBe(99);
    });
  });

  // --- removeRound ---
  describe('removeRound', () => {
    it('should remove the round', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 1 });
      service.addRound({ [id]: 2 });
      const roundId = service.rounds[0].id;
      service.removeRound(roundId);
      expect(service.rounds).toHaveLength(1);
      expect(service.rounds[0].scores[id]).toBe(2);
    });
  });

  // --- getTotalScore ---
  describe('getTotalScore', () => {
    it('should sum scores across all rounds for a player', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 3 });
      service.addRound({ [id]: 7 });
      expect(service.getTotalScore(id)).toBe(10);
    });

    it('should return 0 for unknown player', () => {
      expect(service.getTotalScore('unknown')).toBe(0);
    });
  });

  // --- getWinner ---
  describe('getWinner', () => {
    it('should return null when no players', () => {
      expect(service.getWinner()).toBeNull();
    });

    it('should return null when no rounds', () => {
      service.addPlayer('A');
      expect(service.getWinner()).toBeNull();
    });

    it('should return the player with lowest score when winMode is lowest', () => {
      service.winMode = 'lowest';
      service.addPlayer('A');
      service.addPlayer('B');
      const idA = service.players[0].id;
      const idB = service.players[1].id;
      service.addRound({ [idA]: 10, [idB]: 5 });
      const winner = service.getWinner();
      expect(winner?.player.id).toBe(idB);
      expect(winner?.score).toBe(5);
    });

    it('should return the player with highest score when winMode is highest', () => {
      service.winMode = 'highest';
      service.addPlayer('A');
      service.addPlayer('B');
      const idA = service.players[0].id;
      const idB = service.players[1].id;
      service.addRound({ [idA]: 10, [idB]: 5 });
      const winner = service.getWinner();
      expect(winner?.player.id).toBe(idA);
      expect(winner?.score).toBe(10);
    });
  });

  // --- toggleWinMode ---
  describe('toggleWinMode', () => {
    it('should toggle from lowest to highest', () => {
      service.winMode = 'lowest';
      service.toggleWinMode();
      expect(service.winMode).toBe('highest');
    });

    it('should toggle from highest to lowest', () => {
      service.winMode = 'highest';
      service.toggleWinMode();
      expect(service.winMode).toBe('lowest');
    });
  });

  // --- save / load ---
  describe('save and load', () => {
    it('should persist and restore players, rounds, and winMode', () => {
      service.addPlayer('Alice');
      service.winMode = 'highest';
      const id = service.players[0].id;
      service.addRound({ [id]: 5 });
      service.save();

      const fresh = new GameService();
      expect(fresh.players).toHaveLength(1);
      expect(fresh.players[0].name).toBe('Alice');
      expect(fresh.rounds).toHaveLength(1);
      expect(fresh.winMode).toBe('highest');
    });

    it('should assign colors to legacy players without color', () => {
      mockStorage.setItem('game', JSON.stringify({
        players: [{ id: 'p1', name: 'Legacy' }],
        rounds: [],
      }));
      service.load();
      expect(service.players[0].color).toBeTruthy();
    });

    it('should handle corrupt data gracefully', () => {
      mockStorage.setItem('game', 'not json');
      service.load();
      expect(service.players).toEqual([]);
      expect(service.rounds).toEqual([]);
    });
  });

  // --- reset ---
  describe('reset', () => {
    it('should clear players and rounds and remove storage', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 1 });
      service.reset();
      expect(service.players).toEqual([]);
      expect(service.rounds).toEqual([]);
    });
  });

  // --- resetRounds ---
  describe('resetRounds', () => {
    it('should clear rounds but keep players', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 5 });
      service.resetRounds();
      expect(service.rounds).toEqual([]);
      expect(service.players).toHaveLength(1);
    });
  });

  // --- undo / redo ---
  describe('undo and redo', () => {
    it('canUndo should be false initially', () => {
      expect(service.canUndo).toBe(false);
    });

    it('canRedo should be false initially', () => {
      expect(service.canRedo).toBe(false);
    });

    it('undo should restore previous state after addPlayer', () => {
      service.addPlayer('A');
      expect(service.players).toHaveLength(1);
      service.undo();
      expect(service.players).toHaveLength(0);
    });

    it('redo should restore undone state', () => {
      service.addPlayer('A');
      service.undo();
      expect(service.players).toHaveLength(0);
      service.redo();
      expect(service.players).toHaveLength(1);
      expect(service.players[0].name).toBe('A');
    });

    it('undo should do nothing when stack is empty', () => {
      service.addPlayer('A');
      service.undo();
      service.undo();
      expect(service.players).toHaveLength(0);
    });

    it('redo should do nothing when stack is empty', () => {
      service.redo();
      expect(service.players).toHaveLength(0);
    });

    it('new action after undo should clear redo stack', () => {
      service.addPlayer('A');
      service.undo();
      service.addPlayer('B');
      expect(service.canRedo).toBe(false);
    });

    it('should limit undo stack to MAX_UNDO', () => {
      for (let i = 0; i < 60; i++) {
        service.addPlayer(`P${i}`);
      }
      let undoCount = 0;
      while (service.canUndo) {
        service.undo();
        undoCount++;
      }
      expect(undoCount).toBe(50);
    });
  });

  // --- History ---
  describe('history', () => {
    it('saveToHistory should not save when no rounds', () => {
      service.addPlayer('A');
      service.saveToHistory();
      expect(service.history).toHaveLength(0);
    });

    it('saveToHistory should not save when no players', () => {
      service.saveToHistory();
      expect(service.history).toHaveLength(0);
    });

    it('saveToHistory should create a history entry', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 5 });
      service.saveToHistory();
      expect(service.history).toHaveLength(1);
      expect(service.history[0].players).toHaveLength(1);
      expect(service.history[0].rounds).toHaveLength(1);
      expect(service.history[0].winner).toBeTruthy();
    });

    it('removeHistoryEntry should remove the entry', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 5 });
      service.saveToHistory();
      const entryId = service.history[0].id;
      service.removeHistoryEntry(entryId);
      expect(service.history).toHaveLength(0);
    });

    it('clearHistory should remove all entries', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 5 });
      service.saveToHistory();
      service.saveToHistory();
      service.clearHistory();
      expect(service.history).toHaveLength(0);
    });

    it('reset should save to history before clearing', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 5 });
      service.reset();
      expect(service.history).toHaveLength(1);
    });

    it('resetRounds should save to history before clearing rounds', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 5 });
      service.resetRounds();
      expect(service.history).toHaveLength(1);
      expect(service.rounds).toEqual([]);
    });

    it('should persist and load history', () => {
      service.addPlayer('A');
      const id = service.players[0].id;
      service.addRound({ [id]: 5 });
      service.saveToHistory();

      const data = mockStorage.getItem('gameHistory');
      expect(data).toBeTruthy();

      service.history = [];
      service['loadHistory']();
      expect(service.history).toHaveLength(1);
    });

    it('should handle corrupt history data', () => {
      mockStorage.setItem('gameHistory', 'broken');
      service['loadHistory']();
      expect(service.history).toEqual([]);
    });
  });
});
