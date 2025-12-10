import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TextareaFieldComponent } from './textarea-field.component';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

describe('TextareaFieldComponent', () => {
  let component: TextareaFieldComponent;
  let fixture: ComponentFixture<TextareaFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaFieldComponent, ReactiveFormsModule],
      providers: [provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('ControlValueAccessor', () => {
    it('writeValueで値を設定できること', () => {
      component.writeValue('テストテキスト');
      expect(component._value()).toBe('テストテキスト');
    });

    it('writeValueでnullの場合は空文字になること', () => {
      component.writeValue(null as unknown as string);
      expect(component._value()).toBe('');
    });

    it('registerOnChangeでonChangeが登録されること', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);
      
      component.onInput({ target: { value: '新しいテキスト' } } as unknown as Event);
      
      expect(onChangeSpy).toHaveBeenCalledWith('新しいテキスト');
    });

    it('registerOnTouchedでonTouchedが登録されること', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);
      
      component.onBlur();
      
      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('setDisabledStateでdisabled状態を設定できること', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBeTrue();
    });

    it('デフォルトのonChangeが呼ばれてもエラーにならないこと', () => {
      // フォームコントロールでない状態で呼ぶ
      expect(() => {
        component.onInput({ target: { value: 'テスト' } } as unknown as Event);
      }).not.toThrow();
    });

    it('デフォルトのonTouchedが呼ばれてもエラーにならないこと', () => {
      // フォームコントロールでない状態で呼ぶ
      expect(() => {
        component.onBlur();
      }).not.toThrow();
    });

    it('writeValue後にデフォルトのonChangeが呼ばれてもエラーにならないこと', () => {
      // writeValueでisFormControlをtrueにするが、registerOnChangeは呼ばない
      component.writeValue('初期値');
      expect(() => {
        component.onInput({ target: { value: 'テスト' } } as unknown as Event);
      }).not.toThrow();
    });

    it('writeValue後にデフォルトのonTouchedが呼ばれてもエラーにならないこと', () => {
      // writeValueでisFormControlをtrueにするが、registerOnTouchedは呼ばない
      component.writeValue('初期値');
      expect(() => {
        component.onBlur();
      }).not.toThrow();
    });
  });

  describe('文字数カウント', () => {
    it('charCountが正しく計算されること', () => {
      component.writeValue('テスト');
      expect(component.charCount()).toBe(3);
    });

    it('isOverLimitが正しく動作すること', () => {
      component.maxLength = 5;
      component.writeValue('テスト');
      expect(component.isOverLimit()).toBeFalse();

      component.writeValue('これは6文字のテキスト');
      expect(component.isOverLimit()).toBeTrue();
    });
  });

  describe('valueChangeイベント', () => {
    it('フォームコントロールでない場合、valueChangeが発火すること', () => {
      const emitSpy = spyOn(component.valueChange, 'emit');
      
      component.onInput({ target: { value: '新しい値' } } as unknown as Event);
      
      expect(emitSpy).toHaveBeenCalledWith('新しい値');
    });

    it('valueセッターで値を設定できること', () => {
      component.value = 'セッター経由の値';
      expect(component._value()).toBe('セッター経由の値');
    });

    it('valueセッターにnullを渡すと空文字になること', () => {
      component.value = null as unknown as string;
      expect(component._value()).toBe('');
    });

    it('valueセッターに空文字を渡すと空文字になること', () => {
      component.value = '';
      expect(component._value()).toBe('');
    });
  });

  describe('エラー表示', () => {
    it('errorMessageがある場合、エラーメッセージが表示されること', () => {
      component.errorMessage = 'エラーメッセージ';
      component.touched = true; // touchedをtrueにしてエラーを表示
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.textarea-field__error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('エラーメッセージ');
    });

    it('フォーカス中はエラーメッセージが表示されないこと', () => {
      component.errorMessage = 'エラーメッセージ';
      component.touched = true;
      component.onFocus(); // フォーカスを設定
      fixture.detectChanges();

      expect(component.shouldShowError).toBeFalse();
    });

    it('フォーカス解除後、エラーメッセージが表示されること', () => {
      component.errorMessage = 'エラーメッセージ';
      component.touched = true;
      component.onFocus();
      component.onBlur(); // フォーカスを解除
      fixture.detectChanges();

      expect(component.shouldShowError).toBeTrue();
    });

    it('onFocusでisFocusedがtrueになること', () => {
      component.onFocus();
      expect(component.isFocused()).toBeTrue();
    });

    it('onBlurでisFocusedがfalseになること', () => {
      component.onFocus();
      component.onBlur();
      expect(component.isFocused()).toBeFalse();
    });
  });
});

