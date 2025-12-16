import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GoalService } from '../../../features/goal/services/goal.service';
import { GoalDetailResponse, DailyReportSummary } from '../../../features/goal/models/goal.model';
import { ButtonComponent, EmptyStateComponent } from '../index';

@Component({
  selector: 'app-related-daily-reports-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, EmptyStateComponent],
  templateUrl: './related-daily-reports-list.component.html',
  styleUrl: './related-daily-reports-list.component.scss',
})
export class RelatedDailyReportsListComponent implements OnInit {
  @Input() goalId!: string;
  @Input() limit = 10;
  @Input() sort: 'asc' | 'desc' = 'desc';

  private readonly goalService = inject(GoalService);
  private readonly router = inject(Router);

  // 状態管理
  dailyReports = signal<DailyReportSummary[]>([]);
  totalCount = signal(0);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  currentOffset = signal(0);
  hasMore = signal(false);

  ngOnInit(): void {
    this.loadDailyReports();
  }

  /**
   * 関連日報を取得
   */
  loadDailyReports(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.goalService.getGoal(this.goalId, {
      limit: this.limit,
      offset: this.currentOffset(),
      sort: this.sort,
    }).subscribe({
      next: (goal: GoalDetailResponse) => {
        const reports = goal.relatedDailyReports || [];
        const total = goal.relatedDailyReportsCount || 0;

        if (this.currentOffset() === 0) {
          this.dailyReports.set(reports);
        } else {
          this.dailyReports.update((prev) => [...prev, ...reports]);
        }

        this.totalCount.set(total);
        this.currentOffset.set(this.currentOffset() + reports.length);
        this.hasMore.set(this.currentOffset() < total);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || '関連日報の取得に失敗しました'
        );
        this.isLoading.set(false);
      },
    });
  }

  /**
   * もっと見る
   */
  loadMore(): void {
    this.loadDailyReports();
  }

  /**
   * 並び替えを変更
   */
  onSortChange(sort: string): void {
    this.sort = sort as 'asc' | 'desc';
    this.currentOffset.set(0);
    this.loadDailyReports();
  }

  /**
   * 日報詳細に遷移
   */
  navigateToReport(reportId: string): void {
    this.router.navigate(['/daily-reports', reportId]);
  }

  /**
   * 日付をフォーマット
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${year}/${month}/${day}（${dayOfWeek}）`;
  }
}

