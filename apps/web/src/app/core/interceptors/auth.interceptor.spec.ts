import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../../features/auth/services/auth.service';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('トークン付与', () => {
    it('トークンがある場合、Authorizationヘッダーを付与する', () => {
      authServiceSpy.getToken.and.returnValue('test-token');

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });

    it('トークンがない場合、Authorizationヘッダーを付与しない', () => {
      authServiceSpy.getToken.and.returnValue(null);

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });
  });

  describe('401エラーハンドリング', () => {
    it('401エラーの場合、トークンを削除しログインページにリダイレクトする', () => {
      authServiceSpy.getToken.and.returnValue('test-token');
      localStorage.setItem('auth_token', 'test-token');

      httpClient.get('/api/test').subscribe({
        error: () => {
          // エラーハンドリング
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('401以外のエラーの場合、リダイレクトしない', () => {
      authServiceSpy.getToken.and.returnValue('test-token');

      httpClient.get('/api/test').subscribe({
        error: () => {
          // エラーハンドリング
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });
});

describe('AuthInterceptor (Server環境)', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('401エラーハンドリング（サーバー環境）', () => {
    it('サーバー環境で401エラーの場合、localStorageにアクセスせずリダイレクトする', () => {
      authServiceSpy.getToken.and.returnValue(null);

      httpClient.get('/api/test').subscribe({
        error: () => {
          // エラーハンドリング
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      // サーバー環境ではlocalStorageにアクセスしないので、navigateのみ呼ばれる
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});

