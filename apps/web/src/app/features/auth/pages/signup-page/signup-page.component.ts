import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * サインアップページコンポーネント
 */
@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss',
})
export class SignupPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** ローディング状態 */
  readonly isLoading = signal(false);

  /** エラーメッセージ */
  readonly errorMessage = signal<string | null>(null);

  /** パスワード表示切替 */
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  /** サインアップフォーム */
  readonly signupForm: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  /**
   * パスワード一致バリデーター
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * フォーム送信
   */
  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.signupForm.value;

    this.authService.signup({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'アカウントの作成に失敗しました。もう一度お試しください。'
        );
      },
    });
  }

  /**
   * パスワード表示切替
   */
  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  /**
   * フィールドエラー取得
   */
  getFieldError(fieldName: string): string | null {
    const control = this.signupForm.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      const labels: Record<string, string> = {
        email: 'メールアドレスを入力してください',
        password: 'パスワードを入力してください',
        confirmPassword: '確認用パスワードを入力してください',
      };
      return labels[fieldName] || '入力してください';
    }
    if (control.errors['email']) {
      return '有効なメールアドレスを入力してください';
    }
    if (control.errors['minlength']) {
      return 'パスワードは8文字以上で入力してください';
    }
    if (control.errors['passwordMismatch']) {
      return 'パスワードが一致しません';
    }
    return null;
  }
}

