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

  // TODO: Add daily-report routes here

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
