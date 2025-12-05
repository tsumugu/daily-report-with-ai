import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InputFieldComponent, ButtonComponent, AlertBannerComponent } from '../../../../shared/components';
import { getFieldErrorMessage } from '../../../../shared/utils';

/**
 * ログインページコンポーネント
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputFieldComponent, ButtonComponent, AlertBannerComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** ローディング状態 */
  readonly isLoading = signal(false);

  /** エラーメッセージ */
  readonly errorMessage = signal<string | null>(null);

  /** ログインフォーム */
  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  /**
   * フォーム送信
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
        );
      },
    });
  }

  /**
   * フィールドエラー取得
   */
  getFieldError(fieldName: string): string | null {
    return getFieldErrorMessage(this.loginForm.get(fieldName), fieldName);
  }
}

