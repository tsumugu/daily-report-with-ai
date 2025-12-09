import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatusBadgeComponent, StatusBadgeType } from '../status-badge/status-badge.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent, IconName } from '../icon';
import { WeeklyFocusResponse } from '../../models/weekly-focus.model';

@Component({
  selector: 'app-weekly-focus-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, ButtonComponent, IconComponent],
  templateUrl: './weekly-focus-card.component.html',
  styleUrl: './weekly-focus-card.component.scss',
})
export class WeeklyFocusCardComponent {
  @Input() focus!: WeeklyFocusResponse;
  @Output() deleteClicked = new EventEmitter<string>();

  onDelete(): void {
    if (this.focus?.id) {
      this.deleteClicked.emit(this.focus.id);
    }
  }

  get itemTypeLabel(): string {
    return this.focus?.itemType === 'goodPoint' ? 'よかったこと' : '改善点';
  }

  get itemTypeIcon(): IconName {
    return this.focus?.itemType === 'goodPoint' ? 'heart' : 'file-text';
  }

  get reportDetailUrl(): string {
    return this.focus?.item?.id ? `/daily-reports/${this.focus.item.id}` : '#';
  }

  get status(): StatusBadgeType | undefined {
    return this.focus?.item?.status as StatusBadgeType | undefined;
  }
}

