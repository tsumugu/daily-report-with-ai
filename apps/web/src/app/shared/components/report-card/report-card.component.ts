import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon';

export interface GoodPointSummary {
  count: number;
  statusSummary: {
    再現成功: number;
    定着: number;
  };
}

export interface ImprovementSummary {
  count: number;
  statusSummary: {
    完了: number;
    習慣化: number;
  };
}

export interface ReportCardData {
  id: string;
  date: string;
  events: string;
  goodPointIds: string[];
  improvementIds: string[];
  goodPointSummary: GoodPointSummary;
  improvementSummary: ImprovementSummary;
}

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
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
   * よかったことのサマリーを表示するか
   */
  get shouldShowGoodPointSummary(): boolean {
    return this.report.goodPointSummary.count > 0;
  }

  /**
   * 改善点のサマリーを表示するか
   */
  get shouldShowImprovementSummary(): boolean {
    return this.report.improvementSummary.count > 0;
  }

  /**
   * よかったことのステータス概要を表示するか
   */
  get shouldShowGoodPointStatusSummary(): boolean {
    const summary = this.report.goodPointSummary.statusSummary;
    return summary['再現成功'] > 0 || summary['定着'] > 0;
  }

  /**
   * 改善点のステータス概要を表示するか
   */
  get shouldShowImprovementStatusSummary(): boolean {
    const summary = this.report.improvementSummary.statusSummary;
    return summary['完了'] > 0 || summary['習慣化'] > 0;
  }

  /**
   * サマリーセクションを表示するか
   */
  get shouldShowSummarySection(): boolean {
    return this.shouldShowGoodPointSummary || this.shouldShowImprovementSummary;
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

