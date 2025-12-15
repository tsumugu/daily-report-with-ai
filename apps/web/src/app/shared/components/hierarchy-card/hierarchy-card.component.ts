import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName } from '../icon/icon.component';

/**
 * 階層構造のカード表示コンポーネント
 * 汎用的な階層構造のカード表示に使用可能
 */
export interface HierarchyCardData {
  id: string;
  title: string;
  subtitle?: string;
  metadata?: string;
  level?: 'long' | 'medium' | 'short';
  type?: string;
}

@Component({
  selector: 'app-hierarchy-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './hierarchy-card.component.html',
  styleUrl: './hierarchy-card.component.scss',
})
export class HierarchyCardComponent {
  @Input() data!: HierarchyCardData;
  @Input() showExpandIcon = false;
  @Input() isExpanded = false;
  @Output() clicked = new EventEmitter<string>();
  @Output() expandToggled = new EventEmitter<string>();

  onCardClick(): void {
    this.clicked.emit(this.data.id);
  }

  onExpandToggle(event: Event): void {
    event.stopPropagation();
    this.expandToggled.emit(this.data.id);
  }

  get levelLabel(): string {
    switch (this.data.level) {
      case 'long':
        return '長期目標';
      case 'medium':
        return '中期目標';
      case 'short':
        return '短期目標';
      default:
        return '';
    }
  }

  get expandIconName(): IconName {
    return this.isExpanded ? 'chevron-down' : 'chevron-right';
  }
}

