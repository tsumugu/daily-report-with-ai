import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
  };

  const mockAuthResponse = {
    token: 'mock-jwt-token',
    user: mockUser,
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // localStorageをクリア
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('初期状態', () => {
    it('currentUserはnullであること', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('isAuthenticatedはfalseであること', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('signup', () => {
    it('サインアップが成功した場合、トークンを保存しユーザー情報を設定する', fakeAsync(() => {
      const request = { email: 'test@example.com', password: 'password123' };

      service.signup(request).subscribe((response) => {
        expect(response.token).toBe(mockAuthResponse.token);
        expect(response.user.email).toBe(mockUser.email);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockAuthResponse);

      tick();

      expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
      expect(service.currentUser()?.email).toBe(mockUser.email);
      expect(service.isAuthenticated()).toBeTrue();
    }));

    it('サインアップが失敗した場合、エラーをスローする', fakeAsync(() => {
      const request = { email: 'test@example.com', password: 'password123' };
      let error: unknown;

      service.signup(request).subscribe({
        error: (e) => {
          error = e;
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup`);
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });

      tick();

      expect(error).toBeTruthy();
      expect(service.currentUser()).toBeNull();
    }));
  });

  describe('login', () => {
    it('ログインが成功した場合、トークンを保存しユーザー情報を設定する', fakeAsync(() => {
      const request = { email: 'test@example.com', password: 'password123' };

      service.login(request).subscribe((response) => {
        expect(response.token).toBe(mockAuthResponse.token);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);

      tick();

      expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
      expect(service.isAuthenticated()).toBeTrue();
    }));

    it('ログインが失敗した場合、エラーをスローする', fakeAsync(() => {
      const request = { email: 'test@example.com', password: 'wrong' };
      let error: unknown;

      service.login(request).subscribe({
        error: (e) => {
          error = e;
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      tick();

      expect(error).toBeTruthy();
    }));
  });

  describe('logout', () => {
    it('ログアウトが成功した場合、トークンを削除しログインページに遷移する', fakeAsync(() => {
      // まずログイン状態にする
      localStorage.setItem('auth_token', 'test-token');

      service.logout().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);

      tick();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });

  describe('getMe', () => {
    it('ユーザー情報の取得が成功した場合、currentUserを更新する', fakeAsync(() => {
      service.getMe().subscribe((user) => {
        expect(user.email).toBe(mockUser.email);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      tick();

      expect(service.currentUser()?.email).toBe(mockUser.email);
    }));
  });

  describe('getToken', () => {
    it('ブラウザ環境でトークンがある場合、トークンを返す', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('ブラウザ環境でトークンがない場合、nullを返す', () => {
      expect(service.getToken()).toBeNull();
    });
  });
});

describe('AuthService (Server環境)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getToken', () => {
    it('サーバー環境の場合、nullを返す', () => {
      expect(service.getToken()).toBeNull();
    });
  });
});

