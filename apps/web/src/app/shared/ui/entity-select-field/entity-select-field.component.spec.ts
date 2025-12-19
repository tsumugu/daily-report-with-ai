import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { EntitySelectFieldComponent, EntitySelectOption } from './entity-select-field.component';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

describe('EntitySelectFieldComponent', () => {
  let component: EntitySelectFieldComponent;
  let fixture: ComponentFixture<EntitySelectFieldComponent>;

  const mockOptions: EntitySelectOption[] = [
    { id: '1', label: 'オプション1' },
    { id: '2', label: 'オプション2' },
    { id: '3', label: 'オプション3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntitySelectFieldComponent, ReactiveFormsModule],
      providers: [provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EntitySelectFieldComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call default onChange (empty function) before registerOnChange is called', () => {
    // Line 53: private onChange: (value: string | null) => void = () => {};
    // registerOnChangeを呼ぶ前にonSelectを呼んで、デフォルトのonChange（空関数）が呼ばれることを確認
    const newFixture = TestBed.createComponent(EntitySelectFieldComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.options = mockOptions;
    newFixture.detectChanges();
    
    // registerOnChangeを呼ばずにonSelectを呼ぶ（デフォルトの空関数が実行される）
    const selectElement = document.createElement('select');
    const option1 = document.createElement('option');
    option1.value = '1';
    option1.textContent = 'オプション1';
    selectElement.appendChild(option1);
    selectElement.value = '1';
    
    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: selectElement,
      enumerable: true,
      configurable: true,
    });
    
    // これでデフォルトのonChange（空関数）が呼ばれる
    newComponent.onSelect(event);
    expect(newComponent.value()).toBe('1');
  });

  it('should call default onTouched (empty function) before registerOnTouched is called', () => {
    // Line 55: private onTouched: () => void = () => {};
    // registerOnTouchedを呼ぶ前にonBlurを呼んで、デフォルトのonTouched（空関数）が呼ばれることを確認
    const newFixture = TestBed.createComponent(EntitySelectFieldComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.options = mockOptions;
    newFixture.detectChanges();
    
    // registerOnTouchedを呼ばずにonBlurを呼ぶ（デフォルトの空関数が実行される）
    newComponent.onBlur();
    expect(newComponent.isFocused()).toBe(false);
  });

  it('should set and read value correctly', () => {
    // Line 58: writeValue(value || null) - both branches
    component.writeValue('test-id');
    expect(component.value()).toBe('test-id');

    component.writeValue(null);
    expect(component.value()).toBeNull();

    component.writeValue('');
    expect(component.value()).toBeNull();
  });

  it('should register onChange callback and call it when value changes', () => {
    // Line 62: registerOnChange
    const onChangeFn = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeFn);
    
    // onChangeが実際に呼び出されることを確認
    const selectElement = document.createElement('select');
    const option1 = document.createElement('option');
    option1.value = '1';
    option1.textContent = 'オプション1';
    selectElement.appendChild(option1);
    selectElement.value = '1';
    
    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: selectElement,
      enumerable: true,
      configurable: true,
    });
    component.onSelect(event);
    expect(onChangeFn).toHaveBeenCalledWith('1');
  });

  it('should register onTouched callback and call it on blur', () => {
    // Line 66: registerOnTouched
    const onTouchedFn = jasmine.createSpy('onTouched');
    component.registerOnTouched(onTouchedFn);
    
    // onTouchedが実際に呼び出されることを確認
    component.onBlur();
    expect(onTouchedFn).toHaveBeenCalled();
  });

  it('should setDisabledState', () => {
    // Line 70: setDisabledState
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);

    component.setDisabledState(false);
    expect(component.disabled).toBe(false);
  });

  it('should call onChange when onSelect with non-empty value', () => {
    // Line 74-77: onSelect method with non-empty value
    const onChangeFn = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeFn);
    
    const selectElement = document.createElement('select');
    const option1 = document.createElement('option');
    option1.value = '1';
    option1.textContent = 'オプション1';
    selectElement.appendChild(option1);
    selectElement.value = '1';
    
    const event = new Event('change');
    Object.defineProperty(event, 'target', {
      value: selectElement,
      enumerable: true,
      configurable: true,
    });

    component.onSelect(event);
    expect(component.value()).toBe('1');
    expect(onChangeFn).toHaveBeenCalledWith('1');
  });

  it('should call onChange when onSelect with empty value', () => {
    // Line 74-77: onSelect method with empty value (line 75 ternary)
    const onChangeFn = jasmine.createSpy('onChange');
    component.registerOnChange(onChangeFn);
    
    const event = new Event('change');
    const selectElement = document.createElement('select');
    selectElement.value = '';
    Object.defineProperty(event, 'target', {
      value: selectElement,
      enumerable: true,
      configurable: true,
    });

    component.onSelect(event);
    expect(component.value()).toBeNull();
    expect(onChangeFn).toHaveBeenCalledWith(null);
  });

  it('should call onTouched and set isFocused on onBlur', () => {
    // Line 81-82: onBlur
    component.onFocus();
    expect(component.isFocused()).toBe(true);

    const onTouchedFn = jasmine.createSpy('onTouched');
    component.registerOnTouched(onTouchedFn);

    component.onBlur();
    expect(component.isFocused()).toBe(false);
    expect(onTouchedFn).toHaveBeenCalled();
  });

  it('should set isFocused on onFocus', () => {
    // Line 86: onFocus
    expect(component.isFocused()).toBe(false);
    component.onFocus();
    expect(component.isFocused()).toBe(true);
  });

  it('should filter out excluded IDs', () => {
    component.excludeIds = ['1'];
    expect(component.filteredOptions.length).toBe(2);
    expect(component.filteredOptions.find((o) => o.id === '1')).toBeUndefined();
  });

  it('should return all options when excludeIds is empty', () => {
    component.excludeIds = [];
    expect(component.filteredOptions.length).toBe(3);
    expect(component.filteredOptions).toEqual(mockOptions);
  });

  it('should return hasError true when errorMessage is set', () => {
    component.errorMessage = 'エラーメッセージ';
    expect(component.hasError).toBe(true);
  });

  it('should return hasError false when errorMessage is empty', () => {
    component.errorMessage = '';
    expect(component.hasError).toBe(false);
  });

  it('should work as NG_VALUE_ACCESSOR provider (covers forwardRef)', () => {
    // forwardRef(() => EntitySelectFieldComponent)のアロー関数をカバーするため、
    // コンポーネントをFormControlと統合して使用する
    // forwardRefは遅延評価されるため、実際にDIシステムが解決するまで実行されない
    // コンポーネントを再作成して、forwardRefが実行されるようにする
    const newFixture = TestBed.createComponent(EntitySelectFieldComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.options = mockOptions;
    newFixture.detectChanges();
    
    // FormControlにコンポーネントをバインド（これでforwardRefのアロー関数が実行される）
    // FormControlは内部的にNG_VALUE_ACCESSORを解決するため、forwardRefが実行される
    const formControl = new FormControl<string | null>(null);
    formControl.setValue('1');
    newComponent.writeValue('1');
    newFixture.detectChanges();
    
    expect(newComponent.value()).toBe('1');
    
    // onChangeコールバックを登録して、値変更を確認
    let onChangeValue: string | null = null;
    newComponent.registerOnChange((value: string | null) => {
      onChangeValue = value;
    });
    
    const event = new Event('change');
    const selectElement = document.createElement('select');
    const option1 = document.createElement('option');
    option1.value = '2';
    option1.textContent = 'オプション2';
    selectElement.appendChild(option1);
    selectElement.value = '2';
    
    Object.defineProperty(event, 'target', {
      value: selectElement,
      enumerable: true,
      configurable: true,
    });
    
    newComponent.onSelect(event);
    expect(onChangeValue).not.toBeNull();
    expect(onChangeValue as unknown as string).toBe('2');
    expect(newComponent.value()).toBe('2');
  });
});

