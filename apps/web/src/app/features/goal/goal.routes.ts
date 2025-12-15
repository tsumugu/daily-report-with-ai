import { Routes } from '@angular/router';

export const goalRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/goal-list-page/goal-list-page.component').then(
        (m) => m.GoalListPageComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/goal-form-page/goal-form-page.component').then(
        (m) => m.GoalFormPageComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/goal-detail-page/goal-detail-page.component').then(
        (m) => m.GoalDetailPageComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/goal-form-page/goal-form-page.component').then(
        (m) => m.GoalFormPageComponent
      ),
  },
];

