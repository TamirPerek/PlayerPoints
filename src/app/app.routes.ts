import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'players',
    loadComponent: () => import('./pages/players/players.page').then((m) => m.PlayersPage),
  },
  {
    path: 'rounds',
    loadComponent: () => import('./pages/rounds/rounds.page').then((m) => m.RoundsPage),
  },
  {
    path: 'results',
    loadComponent: () => import('./pages/results/results.page').then((m) => m.ResultsPage),
  },
  { path: '**', redirectTo: '' },
];
