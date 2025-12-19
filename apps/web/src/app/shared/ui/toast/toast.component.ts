import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastVariant = 'success' | 'error' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  @Input() variant: ToastVariant = 'success';
  @Input() message = '';

  get toastClasses(): string {
    const classes = ['toast'];
    classes.push(`toast--${this.variant}`);
    return classes.join(' ');
  }

  get icon(): string {
    switch (this.variant) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }
}

