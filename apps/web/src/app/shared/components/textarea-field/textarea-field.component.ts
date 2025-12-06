import { Component, Input, Output, EventEmitter, forwardRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-textarea-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './textarea-field.component.html',
  styleUrl: './textarea-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaFieldComponent),
      multi: true,
    },
  ],
})
export class TextareaFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() id = '';
  @Input() placeholder = '';
  @Input() errorMessage = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() maxLength = 1000;
  @Input() rows = 4;
  @Input() showCharCount = true;
  @Input() labelIcon = '';
  @Input() set value(val: string) {
    this._value.set(val || '');
  }
  @Output() valueChange = new EventEmitter<string>();

  _value = signal('');

  // ControlValueAccessor implementation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};
  private isFormControl = false;

  charCount = computed(() => this._value().length);
  isOverLimit = computed(() => this.charCount() > this.maxLength);

  writeValue(value: string): void {
    this.isFormControl = true;
    this._value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
    this.isFormControl = true;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
    this.isFormControl = true;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const newValue = textarea.value;
    this._value.set(newValue);
    
    if (this.isFormControl) {
      this.onChange(newValue);
    } else {
      this.valueChange.emit(newValue);
    }
  }

  onBlur(): void {
    if (this.isFormControl) {
      this.onTouched();
    }
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }
}

