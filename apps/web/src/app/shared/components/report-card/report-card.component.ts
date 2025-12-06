import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ReportCardData {
  id: string;
  date: string;
  events: string;
  goodPointIds: string[];
  improvementIds: string[];
}

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-card.component.html',
  styleUrl: './report-card.component.scss',
})
export class ReportCardComponent {
  @Input({ required: true }) report!: ReportCardData;
  @Output() cardClick = new EventEmitter<string>();

  /**
   * できごとの表示テキスト（最大50文字）
   */
  get truncatedEvents(): string {
    const maxLength = 50;
    if (this.report.events.length <= maxLength) {
      return this.report.events;
    }
    return this.report.events.slice(0, maxLength) + '...';
  }

  /**
   * よかったことがあるか
   */
  get hasGoodPoints(): boolean {
    return this.report.goodPointIds.length > 0;
  }

  /**
   * 改善点があるか
   */
  get hasImprovements(): boolean {
    return this.report.improvementIds.length > 0;
  }

  /**
   * 日付を表示用にフォーマット
   */
  get formattedDate(): string {
    const date = new Date(this.report.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${year}/${month}/${day}（${dayOfWeek}）`;
  }

  onCardClick(): void {
    this.cardClick.emit(this.report.id);
  }
}

