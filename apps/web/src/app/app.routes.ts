import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth routes (login, signup)
  ...authRoutes,

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/pages/home-page/home-page.component').then(
        (m) => m.HomePageComponent
      ),
  },

  // Daily Report routes
  {
    path: 'daily-reports/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/daily-report/pages/daily-report-input-page/daily-report-input-page.component').then(
        (m) => m.DailyReportInputPageComponent
      ),
  },
  {
    path: 'daily-reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/pages/home-page/home-page.component').then(
        (m) => m.HomePageComponent
      ),
    // TODO: Replace with DailyReportListPageComponent
  },

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
