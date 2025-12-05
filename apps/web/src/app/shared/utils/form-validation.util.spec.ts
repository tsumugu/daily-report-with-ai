import { FormControl, Validators } from '@angular/forms';
import { getFieldErrorMessage } from './form-validation.util';

describe('getFieldErrorMessage', () => {
  describe('nullまたは未タッチの場合', () => {
    it('controlがnullの場合、nullを返す', () => {
      const result = getFieldErrorMessage(null, 'email');
      expect(result).toBeNull();
    });

    it('controlがtouchedでない場合、nullを返す', () => {
      const control = new FormControl('', Validators.required);
      // touchedにしない
      const result = getFieldErrorMessage(control, 'email');
      expect(result).toBeNull();
    });

    it('controlにエラーがない場合、nullを返す', () => {
      const control = new FormControl('valid@email.com', Validators.email);
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'email');
      expect(result).toBeNull();
    });
  });

  describe('requiredエラー', () => {
    it('emailフィールドの場合、適切なメッセージを返す', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'email');
      expect(result).toBe('メールアドレスを入力してください');
    });

    it('passwordフィールドの場合、適切なメッセージを返す', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'password');
      expect(result).toBe('パスワードを入力してください');
    });

    it('confirmPasswordフィールドの場合、適切なメッセージを返す', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'confirmPassword');
      expect(result).toBe('確認用パスワードを入力してください');
    });

    it('未定義のフィールドの場合、フィールド名を含むメッセージを返す', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'customField');
      expect(result).toBe('customFieldを入力してください');
    });
  });

  describe('emailエラー', () => {
    it('無効なメールアドレスの場合、適切なメッセージを返す', () => {
      const control = new FormControl('invalid-email', Validators.email);
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'email');
      expect(result).toBe('有効なメールアドレスを入力してください');
    });
  });

  describe('minlengthエラー', () => {
    it('最小文字数未満の場合、適切なメッセージを返す', () => {
      const control = new FormControl('short', Validators.minLength(8));
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'password');
      expect(result).toBe('8文字以上で入力してください');
    });
  });

  describe('maxlengthエラー', () => {
    it('最大文字数超過の場合、適切なメッセージを返す', () => {
      const control = new FormControl('a'.repeat(101), Validators.maxLength(100));
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'title');
      expect(result).toBe('100文字以内で入力してください');
    });
  });

  describe('passwordMismatchエラー', () => {
    it('パスワード不一致の場合、適切なメッセージを返す', () => {
      const control = new FormControl('password123');
      control.setErrors({ passwordMismatch: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'confirmPassword');
      expect(result).toBe('パスワードが一致しません');
    });
  });

  describe('カスタムメッセージ', () => {
    it('カスタムメッセージが指定された場合、それを優先する', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      const customMessages = {
        required: 'このフィールドは必須です',
      };
      const result = getFieldErrorMessage(control, 'email', customMessages);
      expect(result).toBe('このフィールドは必須です');
    });

    it('カスタムメッセージに該当がない場合、デフォルトを使用', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      const customMessages = {
        email: 'メール形式で入力してください',
      };
      const result = getFieldErrorMessage(control, 'email', customMessages);
      expect(result).toBe('メールアドレスを入力してください');
    });
  });

  describe('未知のエラー', () => {
    it('未定義のエラーの場合、デフォルトメッセージを返す', () => {
      const control = new FormControl('test');
      control.setErrors({ unknownError: true });
      control.markAsTouched();
      const result = getFieldErrorMessage(control, 'field');
      expect(result).toBe('入力内容を確認してください');
    });
  });
});

