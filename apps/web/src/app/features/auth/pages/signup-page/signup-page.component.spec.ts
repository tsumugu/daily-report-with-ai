import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SignupPageComponent } from './signup-page.component';
import { AuthService } from '../../services/auth.service';

describe('SignupPageComponent', () => {
  let component: SignupPageComponent;
  let fixture: ComponentFixture<SignupPageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockAuthResponse = {
    token: 'mock-token',
    user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signup']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupPageComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPageComponent);
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

    it('signupFormが初期化されていること', () => {
      expect(component.signupForm).toBeTruthy();
      expect(component.signupForm.get('email')).toBeTruthy();
      expect(component.signupForm.get('password')).toBeTruthy();
      expect(component.signupForm.get('confirmPassword')).toBeTruthy();
    });
  });

  describe('フォームバリデーション', () => {
    it('emailが空の場合、フォームは無効であること', () => {
      component.signupForm.patchValue({
        email: '',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(component.signupForm.invalid).toBeTrue();
    });

    it('passwordが8文字未満の場合、フォームは無効であること', () => {
      component.signupForm.patchValue({
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
      });
      expect(component.signupForm.invalid).toBeTrue();
    });

    it('パスワードが一致しない場合、フォームは無効であること', () => {
      component.signupForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      });
      expect(component.signupForm.invalid).toBeTrue();
    });

    it('有効な入力の場合、フォームは有効であること', () => {
      component.signupForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(component.signupForm.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('フォームが無効な場合、markAllAsTouchedを呼び出し、APIを呼ばないこと', () => {
      component.signupForm.patchValue({ email: '', password: '', confirmPassword: '' });
      const markSpy = spyOn(component.signupForm, 'markAllAsTouched');

      component.onSubmit();

      expect(markSpy).toHaveBeenCalled();
      expect(authServiceSpy.signup).not.toHaveBeenCalled();
    });

    it('サインアップが成功した場合、ホームに遷移すること', fakeAsync(() => {
      component.signupForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      authServiceSpy.signup.and.returnValue(of(mockAuthResponse));

      component.onSubmit();
      tick();

      expect(authServiceSpy.signup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('サインアップ中はisLoadingがtrueになること', () => {
      component.signupForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      authServiceSpy.signup.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('サインアップが失敗した場合、エラーメッセージを設定すること', fakeAsync(() => {
      component.signupForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      authServiceSpy.signup.and.returnValue(
        throwError(() => ({ error: { message: 'Email already exists' } }))
      );

      component.onSubmit();
      tick();

      expect(component.isLoading()).toBeFalse();
      expect(component.errorMessage()).toBe('Email already exists');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));

    it('エラーメッセージがない場合、デフォルトメッセージを設定すること', fakeAsync(() => {
      component.signupForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      authServiceSpy.signup.and.returnValue(throwError(() => ({})));

      component.onSubmit();
      tick();

      expect(component.errorMessage()).toBe(
        'アカウントの作成に失敗しました。もう一度お試しください。'
      );
    }));
  });

  describe('getFieldError', () => {
    it('emailフィールドにエラーがある場合、エラーメッセージを返すこと', () => {
      component.signupForm.patchValue({ email: '' });
      component.signupForm.get('email')?.markAsTouched();

      const error = component.getFieldError('email');
      expect(error).toBe('メールアドレスを入力してください');
    });

    it('パスワード不一致エラーの場合、エラーメッセージを返すこと', () => {
      component.signupForm.patchValue({
        password: 'password123',
        confirmPassword: 'different123',
      });
      component.signupForm.get('confirmPassword')?.markAsTouched();
      // トリガーバリデーション
      component.signupForm.updateValueAndValidity();

      const error = component.getFieldError('confirmPassword');
      expect(error).toBe('パスワードが一致しません');
    });
  });
});

