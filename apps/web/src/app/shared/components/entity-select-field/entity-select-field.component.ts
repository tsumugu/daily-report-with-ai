import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { IconComponent } from '../icon';

/**
 * エンティティ選択オプション
 */
export interface EntitySelectOption {
  id: string;
  label: string;
  disabled?: boolean;
}

/**
 * 汎用的なエンティティ選択フィールドコンポーネント
 * ドロップダウンでエンティティを選択するためのコンポーネント
 */
@Component({
  selector: 'app-entity-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './entity-select-field.component.html',
  styleUrl: './entity-select-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EntitySelectFieldComponent),
      multi: true,
    },
  ],
})
export class EntitySelectFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() options: EntitySelectOption[] = [];
  @Input() placeholder = '選択してください';
  @Input() emptyLabel = 'なし';
  @Input() showEmptyOption = true;
  @Input() errorMessage = '';
  @Input() id = '';
  @Input() disabled = false;
  @Input() excludeIds: string[] = [];

  value = signal<string | null>(null);
  isFocused = signal(false);

  // ControlValueAccessor implementation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string | null) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value || null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedValue = select.value === '' ? null : select.value;
    this.value.set(selectedValue);
    this.onChange(selectedValue);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  get filteredOptions(): EntitySelectOption[] {
    return this.options.filter((option) => !this.excludeIds.includes(option.id));
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }
}

