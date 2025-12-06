import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DateFieldComponent } from './date-field.component';

describe('DateFieldComponent', () => {
  let component: DateFieldComponent;
  let fixture: ComponentFixture<DateFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateFieldComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DateFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('ControlValueAccessor', () => {
    it('writeValueで値を設定できること', () => {
      component.writeValue('2025-12-06');
      expect(component.value).toBe('2025-12-06');
    });

    it('registerOnChangeでonChangeが登録されること', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);
      
      component.onInput({ target: { value: '2025-12-07' } } as any);
      
      expect(onChangeSpy).toHaveBeenCalledWith('2025-12-07');
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

  describe('フォーム統合', () => {
    it('writeValueで値が設定されると、input要素に反映されること', () => {
      component.writeValue('2025-12-06');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.value).toBe('2025-12-06');
    });
  });

  describe('エラー表示', () => {
    it('errorMessageがある場合、エラーメッセージが表示されること', () => {
      component.errorMessage = 'エラーメッセージ';
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.date-field__error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('エラーメッセージ');
    });

    it('hasErrorが正しく動作すること', () => {
      component.errorMessage = '';
      expect(component.hasError).toBeFalse();

      component.errorMessage = 'エラー';
      expect(component.hasError).toBeTrue();
    });
  });
});

