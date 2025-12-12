import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent, StatusBadgeType } from '../../../../shared/components/status-badge/status-badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent, IconName } from '../../../../shared/components/icon';
import { IconButtonComponent } from '../../../../shared/components/icon-button';
import { FollowupItem } from '../../../../shared/models/followup.model';

@Component({
  selector: 'app-followup-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, ButtonComponent, IconComponent, IconButtonComponent],
  templateUrl: './followup-card.component.html',
  styleUrl: './followup-card.component.scss',
})
export class FollowupCardComponent {
  @Input() item!: FollowupItem;
  @Input() isInWeeklyFocus = false;
  @Input() isAddingToWeeklyFocus = false;
  @Input() isWeeklyFocusLimitReached = false;
  @Output() cardClick = new EventEmitter<string>();
  @Output() followupClick = new EventEmitter<FollowupItem>();
  @Output() toggleWeeklyFocus = new EventEmitter<FollowupItem>();

  onCardClick(): void {
    this.cardClick.emit(this.item.reportId);
  }

  onFollowupClick(): void {
    this.followupClick.emit(this.item);
  }

  onToggleWeeklyFocus(): void {
    this.toggleWeeklyFocus.emit(this.item);
  }

  get itemTypeLabel(): string {
    return this.item.itemType === 'goodPoint' ? 'よかったこと' : '改善点';
  }

  get itemTypeIcon(): IconName {
    return this.item.itemType === 'goodPoint' ? 'heart' : 'file-text';
  }

  get status(): StatusBadgeType | undefined {
    return this.item?.item?.status as StatusBadgeType | undefined;
  }

  get successCount(): number {
    return this.item?.item?.success_count ?? 0;
  }

  get countLabel(): string {
    return this.item?.itemType === 'goodPoint' ? 'エピソード' : 'アクション';
  }
}

