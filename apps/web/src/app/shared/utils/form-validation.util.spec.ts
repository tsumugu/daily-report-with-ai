import { FormControl } from '@angular/forms';
import { getFieldErrorMessage } from './form-validation.util';

describe('form-validation.util', () => {
  describe('getFieldErrorMessage', () => {
    it('should return null when control is null', () => {
      const result = getFieldErrorMessage(null, 'email');
      expect(result).toBeNull();
    });

    it('should return null when control is not touched', () => {
      const control = new FormControl('');
      control.setErrors({ required: true });
      const result = getFieldErrorMessage(control, 'email');
      expect(result).toBeNull();
    });

    it('should return null when control has no errors', () => {
      const control = new FormControl('test@example.com');
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'email');
      expect(result).toBeNull();
    });

    it('should return required message using custom message', () => {
      const control = new FormControl('');
      control.setErrors({ required: true });
      control.markAsTouched();
      const customMessages = { required: 'このフィールドは必須です' };
      const result = getFieldErrorMessage(control, 'email', customMessages);
      expect(result).toBe('このフィールドは必須です');
    });

    it('should return required message for email field', () => {
      const control = new FormControl('');
      control.setErrors({ required: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'email');
      expect(result).toBe('メールアドレスを入力してください');
    });

    it('should return required message for password field', () => {
      const control = new FormControl('');
      control.setErrors({ required: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'password');
      expect(result).toBe('パスワードを入力してください');
    });

    it('should return required message for confirmPassword field', () => {
      const control = new FormControl('');
      control.setErrors({ required: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'confirmPassword');
      expect(result).toBe('確認用パスワードを入力してください');
    });

    it('should return required message for name field', () => {
      const control = new FormControl('');
      control.setErrors({ required: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'name');
      expect(result).toBe('名前を入力してください');
    });

    it('should return required message for title field', () => {
      const control = new FormControl('');
      control.setErrors({ required: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'title');
      expect(result).toBe('タイトルを入力してください');
    });

    it('should return default required message for unknown field', () => {
      const control = new FormControl('');
      control.setErrors({ required: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'unknownField');
      expect(result).toBe('unknownFieldを入力してください');
    });

    it('should call getRequiredMessage for all known field types', () => {
      // getRequiredMessage関数のすべての分岐をカバーするため、
      // 既知のフィールドタイプすべてをテスト
      const knownFields = ['email', 'password', 'confirmPassword', 'name', 'title'];
      knownFields.forEach((fieldName) => {
        const control = new FormControl('');
        control.setErrors({ required: true });
        control.markAsTouched();
        const result = getFieldErrorMessage(control, fieldName);
        expect(result).toBeTruthy();
        expect(result).toContain('を入力してください');
      });
    });

    it('should return email error message', () => {
      const control = new FormControl('invalid-email');
      control.setErrors({ email: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'email');
      expect(result).toBe('有効なメールアドレスを入力してください');
    });

    it('should return minlength error message', () => {
      const control = new FormControl('abc');
      control.setErrors({ minlength: { requiredLength: 8, actualLength: 3 } });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'password');
      expect(result).toBe('8文字以上で入力してください');
    });

    it('should return maxlength error message', () => {
      const control = new FormControl('a'.repeat(300));
      control.setErrors({ maxlength: { requiredLength: 255, actualLength: 300 } });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'title');
      expect(result).toBe('255文字以内で入力してください');
    });

    it('should return passwordMismatch error message', () => {
      const control = new FormControl('');
      control.setErrors({ passwordMismatch: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'confirmPassword');
      expect(result).toBe('パスワードが一致しません');
    });

    it('should return generic error message for unknown error type', () => {
      const control = new FormControl('');
      control.setErrors({ unknownError: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'field');
      expect(result).toBe('入力内容を確認してください');
    });

    it('should prioritize custom message over required message', () => {
      const control = new FormControl('');
      control.setErrors({ required: true, email: true });
      control.markAsTouched();
      const customMessages = { required: 'カスタム必須メッセージ' };
      const result = getFieldErrorMessage(control, 'email', customMessages);
      expect(result).toBe('カスタム必須メッセージ');
    });

    it('should handle multiple errors with custom message', () => {
      const control = new FormControl('');
      control.setErrors({ email: true, minlength: { requiredLength: 5 } });
      control.markAsTouched();
      const customMessages = { email: 'カスタムメール' };
      const result = getFieldErrorMessage(control, 'field', customMessages);
      expect(result).toBe('カスタムメール');
    });
  });
});
