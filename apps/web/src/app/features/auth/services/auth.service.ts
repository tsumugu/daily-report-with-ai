import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../models/auth.model';

/**
 * 認証サービス
 * ログイン/サインアップ/ログアウト/ユーザー情報取得を管理
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /** 現在のユーザー情報（Signal） */
  private readonly currentUserSignal = signal<User | null>(null);

  /** 現在のユーザー（読み取り専用） */
  readonly currentUser = this.currentUserSignal.asReadonly();

  /** ログイン状態 */
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  /**
   * サインアップ
   */
  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, request).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.currentUserSignal.set(response.user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * ログイン
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.currentUserSignal.set(response.user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * ログアウト
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearToken();
        this.currentUserSignal.set(null);
        this.router.navigate(['/login']);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * 現在のユーザー情報を取得
   */
  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * ブラウザ環境かどうか
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * トークンを取得
   */
  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('auth_token');
  }

  /**
   * トークンを保存
   */
  private setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * トークンを削除
   */
  private clearToken(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: unknown): Observable<never> {
    console.error('Auth error:', error);
    return throwError(() => error);
  }
}

