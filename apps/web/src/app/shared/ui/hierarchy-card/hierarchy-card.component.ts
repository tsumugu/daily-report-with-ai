import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName } from '../icon/icon.component';

/**
 * 階層構造のカード表示コンポーネント
 * 汎用的な階層構造のカード表示に使用可能
 */
@Component({
  selector: 'app-hierarchy-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './hierarchy-card.component.html',
  styleUrl: './hierarchy-card.component.scss',
})
export class HierarchyCardComponent {
  @Input() id!: string;
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() metadata?: string;
  @Input() levelName?: string;
  @Input() showExpandIcon = false;
  @Input() isExpanded = false;

  @Output() clicked = new EventEmitter<string>();
  @Output() expandToggled = new EventEmitter<string>();

  onCardClick(): void {
    this.clicked.emit(this.id);
  }

  onExpandToggle(event: Event): void {
    event.stopPropagation();
    this.expandToggled.emit(this.id);
  }

  get expandIconName(): IconName {
    return this.isExpanded ? 'chevron-down' : 'chevron-right';
  }
}

