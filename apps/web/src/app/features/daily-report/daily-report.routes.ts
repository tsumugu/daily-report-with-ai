import { Routes } from '@angular/router';

export const dailyReportRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/daily-report-input-page/daily-report-input-page.component').then(
        (m) => m.DailyReportInputPageComponent
      ),
  },
];

