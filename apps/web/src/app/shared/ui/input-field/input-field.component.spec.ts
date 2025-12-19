import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputFieldComponent } from './input-field.component';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

// テスト用ホストコンポーネント
@Component({
  standalone: true,
  imports: [InputFieldComponent, ReactiveFormsModule],
  template: `<app-input-field [formControl]="control"></app-input-field>`,
})
class TestHostComponent {
  control = new FormControl('');
}

describe('InputFieldComponent', () => {
  let component: InputFieldComponent;
  let fixture: ComponentFixture<InputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputFieldComponent],
      providers: [provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(InputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('初期状態', () => {
    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('valueは空文字であること', () => {
      expect(component.value()).toBe('');
    });

    it('showPasswordはfalseであること', () => {
      expect(component.showPassword()).toBeFalse();
    });

    it('isFocusedはfalseであること', () => {
      expect(component.isFocused()).toBeFalse();
    });

    it('disabledはfalseであること', () => {
      expect(component.disabled).toBeFalse();
    });
  });

  describe('ControlValueAccessor', () => {
    it('writeValueで値が設定されること', () => {
      component.writeValue('test value');
      expect(component.value()).toBe('test value');
    });

    it('writeValueでnullの場合、空文字が設定されること', () => {
      component.writeValue(null as unknown as string);
      expect(component.value()).toBe('');
    });

    it('registerOnChangeでコールバックが登録されること', () => {
      const spy = jasmine.createSpy('onChange');
      component.registerOnChange(spy);
      
      const event = { target: { value: 'new value' } } as unknown as Event;
      component.onInput(event);
      
      expect(spy).toHaveBeenCalledWith('new value');
    });

    it('registerOnTouchedでコールバックが登録されること', () => {
      const spy = jasmine.createSpy('onTouched');
      component.registerOnTouched(spy);
      
      component.onBlur();
      
      expect(spy).toHaveBeenCalled();
    });

    it('setDisabledStateでdisabledが設定されること', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBeTrue();
      
      component.setDisabledState(false);
      expect(component.disabled).toBeFalse();
    });
  });

  describe('onInput', () => {
    it('入力時にvalueが更新されること', () => {
      const event = { target: { value: 'typed value' } } as unknown as Event;
      component.onInput(event);
      expect(component.value()).toBe('typed value');
    });
  });

  describe('onFocus / onBlur', () => {
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

  describe('togglePasswordVisibility', () => {
    it('showPasswordがトグルされること', () => {
      expect(component.showPassword()).toBeFalse();
      
      component.togglePasswordVisibility();
      expect(component.showPassword()).toBeTrue();
      
      component.togglePasswordVisibility();
      expect(component.showPassword()).toBeFalse();
    });
  });

  describe('inputType', () => {
    it('typeがtextの場合、textを返す', () => {
      component.type = 'text';
      expect(component.inputType).toBe('text');
    });

    it('typeがemailの場合、emailを返す', () => {
      component.type = 'email';
      expect(component.inputType).toBe('email');
    });

    it('typeがpasswordでshowPasswordがfalseの場合、passwordを返す', () => {
      component.type = 'password';
      component.showPassword.set(false);
      expect(component.inputType).toBe('password');
    });

    it('typeがpasswordでshowPasswordがtrueの場合、textを返す', () => {
      component.type = 'password';
      component.showPassword.set(true);
      expect(component.inputType).toBe('text');
    });
  });

  describe('hasError', () => {
    it('errorMessageが空の場合、falseを返す', () => {
      component.errorMessage = '';
      expect(component.hasError).toBeFalse();
    });

    it('errorMessageがある場合、trueを返す', () => {
      component.errorMessage = 'エラーメッセージ';
      expect(component.hasError).toBeTrue();
    });
  });
});

describe('InputFieldComponent with ReactiveForm', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideLucideIconsForTesting()],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('FormControlと連携できること', () => {
    hostComponent.control.setValue('reactive value');
    hostFixture.detectChanges();

    const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('reactive value');
  });
});

