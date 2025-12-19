import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ビュー切り替えトグルコンポーネント
 * 2つのビューを切り替えるための汎用的なコンポーネント
 */
@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-toggle.component.html',
  styleUrl: './view-toggle.component.scss',
})
export class ViewToggleComponent {
  @Input() viewType: 'tree' | 'card' = 'tree';
  @Input() treeLabel = '階層表示';
  @Input() cardLabel = 'カード表示';
  @Output() viewTypeChange = new EventEmitter<'tree' | 'card'>();

  onViewTypeChange(newViewType: 'tree' | 'card'): void {
    if (this.viewType !== newViewType) {
      this.viewType = newViewType;
      this.viewTypeChange.emit(newViewType);
    }
  }
}

