import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * 認証インターセプター
 * リクエストにAuthorizationヘッダーを付与
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const token = authService.getToken();

  // トークンがあればヘッダーに付与
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401エラーの場合はログインページにリダイレクト
      if (error.status === 401) {
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('auth_token');
        }
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

