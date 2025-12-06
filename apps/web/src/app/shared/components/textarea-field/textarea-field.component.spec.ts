import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TextareaFieldComponent } from './textarea-field.component';

describe('TextareaFieldComponent', () => {
  let component: TextareaFieldComponent;
  let fixture: ComponentFixture<TextareaFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaFieldComponent, ReactiveFormsModule],
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

    it('registerOnChangeでonChangeが登録されること', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);
      
      component.onInput({ target: { value: '新しいテキスト' } } as any);
      
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
      
      component.onInput({ target: { value: '新しい値' } } as any);
      
      expect(emitSpy).toHaveBeenCalledWith('新しい値');
    });

    it('valueセッターで値を設定できること', () => {
      component.value = 'セッター経由の値';
      expect(component._value()).toBe('セッター経由の値');
    });
  });

  describe('エラー表示', () => {
    it('errorMessageがある場合、エラーメッセージが表示されること', () => {
      component.errorMessage = 'エラーメッセージ';
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.textarea-field__error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('エラーメッセージ');
    });
  });
});

