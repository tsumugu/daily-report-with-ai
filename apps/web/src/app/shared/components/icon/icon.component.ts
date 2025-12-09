import { Component, Input } from '@angular/core';
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
  | 'heart';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <lucide-angular
      [name]="iconName"
      [size]="size"
      [color]="color"
      [attr.aria-label]="ariaLabel || name"
    />
  `,
  styles: [
    `:host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }`
  ]
})
export class IconComponent {
  @Input() name!: IconName;
  @Input() size = 24;
  @Input() color?: string;
  @Input() ariaLabel?: string;

  get iconName(): string {
    // 必要なマッピングのみ対応
    if (this.name === 'bar-chart-3') return 'chart-bar';
    if (this.name === 'alert-triangle') return 'triangle-alert';
    return this.name;
  }
}

