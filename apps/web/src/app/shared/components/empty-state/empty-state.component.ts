import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { IconComponent, IconName } from '../icon/icon.component';

/**
 * Empty State コンポーネント
 * データが空の状態を表示する汎用コンポーネント
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  // アイコン設定（オプション）
  @Input() iconName?: IconName;
  @Input() iconSize = 48;
  @Input() iconColor = 'var(--color-gray-400)';

  // メッセージ
  @Input() message!: string; // 必須
  @Input() subMessage?: string; // オプション

  // 表示モード
  @Input() variant: 'default' | 'compact' = 'default'; // compact: タイトルのみ表示

  // アクションボタン設定（オプション）
  @Input() actionButtonText?: string;
  @Input() actionButtonVariant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() actionButtonRoute?: string; // ルーターリンクの場合
  @Input() actionButtonIcon: 'none' | 'plus' = 'none';

  // アクションボタンのクリックイベント
  @Output() actionButtonClick = new EventEmitter<void>();

  onActionButtonClick(): void {
    this.actionButtonClick.emit();
  }
}

