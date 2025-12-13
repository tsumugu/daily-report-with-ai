import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

/**
 * アイコン名の型定義
 */
export type IconName =
  | 'file-text'
  | 'clipboard'
  | 'bar-chart-3'
  | 'target'
  | 'sparkles'
  | 'lightbulb'
  | 'calendar'
  | 'alert-triangle'
  | 'triangle-alert'
  | 'eye'
  | 'eye-off'
  | 'heart'
  | 'pin'
  | 'check'
  | 'pencil';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <lucide-angular
      [name]="iconName"
      [size]="size"
      [color]="color"
      [attr.aria-label]="ariaLabel || name"
      [ngClass]="{'icon--filled': fill && fill !== 'none'}"
      [style.--fill-color]="fillColor"
    />
  `,
  styles: [
    `app-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .icon--filled svg path {
      stroke-width: 0.5 !important;
      fill: var(--fill-color, currentColor) !important;
      stroke: var(--fill-color, currentColor) !important;
    }`
  ]
})
export class IconComponent {
  @Input() name!: IconName;
  @Input() size = 24;
  @Input() color?: string;
  @Input() fill?: string;
  @Input() ariaLabel?: string;

  get iconName(): string {
    // 必要なマッピングのみ対応
    if (this.name === 'bar-chart-3') return 'chart-bar';
    if (this.name === 'alert-triangle') return 'triangle-alert';
    return this.name;
  }

  get fillColor(): string | null {
    return this.fill && this.fill !== 'none' ? this.fill : null;
  }
}

