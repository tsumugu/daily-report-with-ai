import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import {
  LucideAngularModule,
  FileText,
  Clipboard,
  ChartBar,
  Target,
  Sparkles,
  Lightbulb,
  Calendar,
  TriangleAlert,
  Eye,
  EyeOff,
  Heart,
  Pin,
  Check,
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    importProvidersFrom(
      LucideAngularModule.pick({
        FileText,
        Clipboard,
        ChartBar,
        Target,
        Sparkles,
        Lightbulb,
        Calendar,
        TriangleAlert,
        Eye,
        EyeOff,
        Heart,
        Pin,
        Check,
      })
    ),
  ],
};
