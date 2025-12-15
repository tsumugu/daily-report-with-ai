import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DailyReportService } from '../../services/daily-report.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ReportCardComponent, ReportCardData, ButtonComponent, AlertBannerComponent, IconComponent, EmptyStateComponent } from '../../../../shared/components';
import { listItemAnimation } from '../../../../shared/animations/page.animations';

@Component({
  selector: 'app-daily-report-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReportCardComponent,
    ButtonComponent,
    AlertBannerComponent,
    IconComponent,
    EmptyStateComponent,
  ],
  templateUrl: './daily-report-list-page.component.html',
  styleUrl: './daily-report-list-page.component.scss',
  animations: [listItemAnimation],
})
export class DailyReportListPageComponent implements OnInit {
  private readonly dailyReportService = inject(DailyReportService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  // 状態管理
  reports = signal<ReportCardData[]>([]);
  total = signal(0);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  errorMessage = signal<string | null>(null);

  // ページング
  private offset = 0;
  private readonly limit = 30;

  ngOnInit(): void {
    this.loadReports();
  }

  /**
   * 日報一覧を取得
   */
  loadReports(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.offset = 0;

    this.dailyReportService.getAll().subscribe({
      next: (response) => {
        this.reports.set(response.data);
        this.total.set(response.total);
        this.offset = response.data.length;
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || '日報の読み込みに失敗しました'
        );
      },
    });
  }

  /**
   * 追加読み込み
   */
  loadMore(): void {
    if (this.isLoadingMore() || this.offset >= this.total()) {
      return;
    }

    this.isLoadingMore.set(true);

    this.dailyReportService.getAllWithPaging(this.limit, this.offset).subscribe({
      next: (response) => {
        this.reports.update((current) => [...current, ...response.data]);
        this.offset += response.data.length;
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.isLoadingMore.set(false);
      },
    });
  }

  /**
   * まだ読み込めるデータがあるか
   */
  get hasMore(): boolean {
    return this.offset < this.total();
  }

  /**
   * 日報詳細に遷移
   */
  onReportClick(id: string): void {
    this.router.navigate(['/daily-reports', id]);
  }

  /**
   * ログアウト
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  /**
   * 再読み込み
   */
  retry(): void {
    this.loadReports();
  }
}

