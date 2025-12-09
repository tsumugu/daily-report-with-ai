import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName } from '../icon';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
})
export class IconButtonComponent {
  @Input() iconName!: IconName;
  @Input() size = 24;
  @Input() color?: string;
  @Input() tooltip = '';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() ariaLabel = '';
  @Input() pinned = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  get buttonClasses(): string {
    const classes = ['icon-button'];
    if (this.disabled) classes.push('icon-button--disabled');
    if (this.loading) classes.push('icon-button--loading');
    if (this.pinned) classes.push('icon-button--pinned');
    return classes.join(' ');
  }
}

