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
    // Provide a simple in-memory localStorage mock for the service
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      configurable: true,
    });
    TestBed.configureTestingModule({
      providers: [GameService],
    });
    service = TestBed.inject(GameService);
    mockStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
