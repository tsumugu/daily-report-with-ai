import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertBannerComponent } from './alert-banner.component';

describe('AlertBannerComponent', () => {
  let component: AlertBannerComponent;
  let fixture: ComponentFixture<AlertBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('初期状態', () => {
    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('variantのデフォルトはinfoであること', () => {
      expect(component.variant).toBe('info');
    });

    it('messageのデフォルトは空文字であること', () => {
      expect(component.message).toBe('');
    });

    it('dismissibleのデフォルトはfalseであること', () => {
      expect(component.dismissible).toBeFalse();
    });
  });

  describe('onDismiss', () => {
    it('dismissedイベントが発火すること', () => {
      const spy = spyOn(component.dismissed, 'emit');

      component.onDismiss();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('alertClasses', () => {
    it('デフォルトのクラスが返されること', () => {
      expect(component.alertClasses).toBe('alert alert--info');
    });

    it('variantがsuccessの場合、対応するクラスが返されること', () => {
      component.variant = 'success';
      expect(component.alertClasses).toBe('alert alert--success');
    });

    it('variantがwarningの場合、対応するクラスが返されること', () => {
      component.variant = 'warning';
      expect(component.alertClasses).toBe('alert alert--warning');
    });

    it('variantがerrorの場合、対応するクラスが返されること', () => {
      component.variant = 'error';
      expect(component.alertClasses).toBe('alert alert--error');
    });
  });

  describe('icon', () => {
    it('variantがsuccessの場合、✓を返すこと', () => {
      component.variant = 'success';
      expect(component.icon).toBe('✓');
    });

    it('variantがwarningの場合、⚠を返すこと', () => {
      component.variant = 'warning';
      expect(component.icon).toBe('⚠');
    });

    it('variantがerrorの場合、✕を返すこと', () => {
      component.variant = 'error';
      expect(component.icon).toBe('✕');
    });

    it('variantがinfoの場合、ℹを返すこと', () => {
      component.variant = 'info';
      expect(component.icon).toBe('ℹ');
    });

    it('variantが未知の値の場合、ℹを返すこと', () => {
      // @ts-expect-error - テスト用に不正な値を設定
      component.variant = 'unknown';
      expect(component.icon).toBe('ℹ');
    });
  });

  describe('DOM', () => {
    it('alertロールが設定されること', () => {
      const alert = fixture.nativeElement.querySelector('.alert');
      expect(alert.getAttribute('role')).toBe('alert');
    });

    it('messageが表示されること', () => {
      component.message = 'テストメッセージ';
      fixture.detectChanges();

      const content = fixture.nativeElement.querySelector('.alert__content');
      expect(content.textContent).toContain('テストメッセージ');
    });

    it('iconが表示されること', () => {
      component.variant = 'success';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.alert__icon');
      expect(icon.textContent).toContain('✓');
    });

    it('dismissibleがfalseの場合、閉じるボタンが表示されないこと', () => {
      component.dismissible = false;
      fixture.detectChanges();

      // 実際のクラス名は alert__dismiss
      const dismissButton = fixture.nativeElement.querySelector('.alert__dismiss');
      expect(dismissButton).toBeFalsy();
    });

    it('dismissibleがtrueの場合、閉じるボタンが表示されること', () => {
      component.dismissible = true;
      fixture.detectChanges();

      // 実際のクラス名は alert__dismiss
      const dismissButton = fixture.nativeElement.querySelector('.alert__dismiss');
      expect(dismissButton).toBeTruthy();
    });

    it('閉じるボタンをクリックするとdismissedイベントが発火すること', () => {
      component.dismissible = true;
      fixture.detectChanges();

      const spy = spyOn(component.dismissed, 'emit');
      const dismissButton = fixture.nativeElement.querySelector('.alert__dismiss');
      dismissButton.click();

      expect(spy).toHaveBeenCalled();
    });
  });
});
