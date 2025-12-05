import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * フォームフィールドのエラーメッセージを取得
 */
export function getFieldErrorMessage(
  control: AbstractControl | null,
  fieldName: string,
  customMessages?: Partial<Record<string, string>>
): string | null {
  if (!control || !control.touched || !control.errors) {
    return null;
  }

  const errors: ValidationErrors = control.errors;

  // カスタムメッセージがあれば優先
  if (customMessages) {
    for (const errorKey in errors) {
      if (customMessages[errorKey]) {
        return customMessages[errorKey]!;
      }
    }
  }

  // デフォルトメッセージ
  if (errors['required']) {
    return getRequiredMessage(fieldName);
  }
  if (errors['email']) {
    return '有効なメールアドレスを入力してください';
  }
  if (errors['minlength']) {
    const requiredLength = errors['minlength'].requiredLength;
    return `${requiredLength}文字以上で入力してください`;
  }
  if (errors['maxlength']) {
    const requiredLength = errors['maxlength'].requiredLength;
    return `${requiredLength}文字以内で入力してください`;
  }
  if (errors['passwordMismatch']) {
    return 'パスワードが一致しません';
  }

  return '入力内容を確認してください';
}

/**
 * 必須フィールドのエラーメッセージを取得
 */
function getRequiredMessage(fieldName: string): string {
  const messages: Record<string, string> = {
    email: 'メールアドレスを入力してください',
    password: 'パスワードを入力してください',
    confirmPassword: '確認用パスワードを入力してください',
    name: '名前を入力してください',
    title: 'タイトルを入力してください',
  };

  return messages[fieldName] || `${fieldName}を入力してください`;
}

