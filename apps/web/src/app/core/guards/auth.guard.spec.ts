import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../../features/auth/services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  describe('認証済みユーザー', () => {
    it('トークンがある場合、trueを返す', () => {
      authServiceSpy.getToken.and.returnValue('test-token');

      const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('未認証ユーザー', () => {
    it('トークンがない場合、ログインページにリダイレクトしfalseを返す', () => {
      authServiceSpy.getToken.and.returnValue(null);

      const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});

describe('guestGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  describe('未認証ユーザー', () => {
    it('トークンがない場合、trueを返す', () => {
      authServiceSpy.getToken.and.returnValue(null);

      const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('認証済みユーザー', () => {
    it('トークンがある場合、ホームにリダイレクトしfalseを返す', () => {
      authServiceSpy.getToken.and.returnValue('test-token');

      const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});

