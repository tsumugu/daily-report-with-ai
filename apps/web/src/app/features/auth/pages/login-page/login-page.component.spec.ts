import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../../services/auth.service';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockAuthResponse = {
    token: 'mock-token',
    user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('初期状態', () => {
    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('isLoadingはfalseであること', () => {
      expect(component.isLoading()).toBeFalse();
    });

    it('errorMessageはnullであること', () => {
      expect(component.errorMessage()).toBeNull();
    });

    it('loginFormが初期化されていること', () => {
      expect(component.loginForm).toBeTruthy();
      expect(component.loginForm.get('email')).toBeTruthy();
      expect(component.loginForm.get('password')).toBeTruthy();
    });
  });

  describe('フォームバリデーション', () => {
    it('emailが空の場合、フォームは無効であること', () => {
      component.loginForm.patchValue({ email: '', password: 'password123' });
      expect(component.loginForm.invalid).toBeTrue();
    });

    it('emailが無効な形式の場合、フォームは無効であること', () => {
      component.loginForm.patchValue({ email: 'invalid-email', password: 'password123' });
      expect(component.loginForm.invalid).toBeTrue();
    });

    it('passwordが空の場合、フォームは無効であること', () => {
      component.loginForm.patchValue({ email: 'test@example.com', password: '' });
      expect(component.loginForm.invalid).toBeTrue();
    });

    it('passwordが8文字未満の場合、フォームは無効であること', () => {
      component.loginForm.patchValue({ email: 'test@example.com', password: 'short' });
      expect(component.loginForm.invalid).toBeTrue();
    });

    it('有効な入力の場合、フォームは有効であること', () => {
      component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('フォームが無効な場合、markAllAsTouchedを呼び出し、APIを呼ばないこと', () => {
      component.loginForm.patchValue({ email: '', password: '' });
      const markSpy = spyOn(component.loginForm, 'markAllAsTouched');

      component.onSubmit();

      expect(markSpy).toHaveBeenCalled();
      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('ログインが成功した場合、ホームに遷移すること', fakeAsync(() => {
      component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
      authServiceSpy.login.and.returnValue(of(mockAuthResponse));

      component.onSubmit();
      tick();

      expect(authServiceSpy.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('ログイン中はisLoadingがtrueになること', () => {
      component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
      authServiceSpy.login.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      // 呼び出し直後
      expect(component.isLoading()).toBeTrue();
    });

    it('ログインが失敗した場合、エラーメッセージを設定すること', fakeAsync(() => {
      component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
      authServiceSpy.login.and.returnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );

      component.onSubmit();
      tick();

      expect(component.isLoading()).toBeFalse();
      expect(component.errorMessage()).toBe('Invalid credentials');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));

    it('エラーメッセージがない場合、デフォルトメッセージを設定すること', fakeAsync(() => {
      component.loginForm.patchValue({ email: 'test@example.com', password: 'password123' });
      authServiceSpy.login.and.returnValue(throwError(() => ({})));

      component.onSubmit();
      tick();

      expect(component.errorMessage()).toBe(
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      );
    }));
  });

  describe('getFieldError', () => {
    it('emailフィールドにエラーがある場合、エラーメッセージを返すこと', () => {
      component.loginForm.patchValue({ email: '' });
      component.loginForm.get('email')?.markAsTouched();

      const error = component.getFieldError('email');
      expect(error).toBe('メールアドレスを入力してください');
    });

    it('emailが無効な形式の場合、エラーメッセージを返すこと', () => {
      component.loginForm.patchValue({ email: 'invalid' });
      component.loginForm.get('email')?.markAsTouched();

      const error = component.getFieldError('email');
      expect(error).toBe('有効なメールアドレスを入力してください');
    });

    it('passwordが短すぎる場合、エラーメッセージを返すこと', () => {
      component.loginForm.patchValue({ password: 'short' });
      component.loginForm.get('password')?.markAsTouched();

      const error = component.getFieldError('password');
      expect(error).toBe('8文字以上で入力してください');
    });

    it('フィールドが有効な場合、nullを返すこと', () => {
      component.loginForm.patchValue({ email: 'test@example.com' });
      component.loginForm.get('email')?.markAsTouched();

      const error = component.getFieldError('email');
      expect(error).toBeNull();
    });
  });
});
