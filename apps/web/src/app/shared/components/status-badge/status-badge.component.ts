import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusBadgeType =
  | '未着手'
  | '進行中'
  | '再現成功'
  | '再現できず'
  | '完了'
  | '未達成'
  | '定着'
  | '習慣化';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  @Input() status: StatusBadgeType = '未着手';

  get badgeClasses(): string {
    const classes = ['status-badge'];
    classes.push(`status-badge--${this.getStatusClass(this.status)}`);
    return classes.join(' ');
  }

  private getStatusClass(status: StatusBadgeType): string {
    switch (status) {
      case '未着手':
        return 'not-started';
      case '進行中':
        return 'in-progress';
      case '再現成功':
      case '完了':
        return 'success';
      case '定着':
      case '習慣化':
        return 'settled';
      case '再現できず':
      case '未達成':
        return 'failed';
      default:
        return 'not-started';
    }
  }
}

