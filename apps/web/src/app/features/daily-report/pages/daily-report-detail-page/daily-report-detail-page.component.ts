import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DailyReportService } from '../../services/daily-report.service';
import { AuthService } from '../../../auth/services/auth.service';
import { DailyReport, GoodPointStatus, ImprovementStatus } from '../../models/daily-report.model';
import { ButtonComponent, AlertBannerComponent, IconComponent, StatusBadgeComponent, StatusBadgeType } from '../../../../shared/components';

@Component({
  selector: 'app-daily-report-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    AlertBannerComponent,
    IconComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './daily-report-detail-page.component.html',
  styleUrl: './daily-report-detail-page.component.scss',
})
export class DailyReportDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dailyReportService = inject(DailyReportService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  // 状態管理
  report = signal<DailyReport | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(id);
    } else {
      this.errorMessage.set('日報IDが指定されていません');
      this.isLoading.set(false);
    }
  }

  /**
   * 日報詳細を取得
   */
  loadReport(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dailyReportService.getById(id).subscribe({
      next: (report) => {
        this.report.set(report);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.errorMessage.set('日報が見つかりません');
        } else if (err.status === 403) {
          this.errorMessage.set('この日報へのアクセス権限がありません');
        } else {
          this.errorMessage.set(
            err.error?.message || '日報の読み込みに失敗しました'
          );
        }
      },
    });
  }

  /**
   * 日付を表示用にフォーマット
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${year}/${month}/${day}（${dayOfWeek}）`;
  }

  /**
   * 一覧に戻る
   */
  goBack(): void {
    this.router.navigate(['/daily-reports']);
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(id);
    }
  }

  /**
   * よかったことのステータスをStatusBadgeTypeに変換
   */
  getGoodPointStatusBadgeType(status: GoodPointStatus): StatusBadgeType {
    // 後方互換性のため、古いステータスを新しいステータスにマッピング
    switch (status) {
      case '未対応':
        return '未着手';
      case '未達':
        return '未達成';
      case '再現成功':
        return '再現成功';
      default:
        // 新しいステータス型の場合はそのまま返す
        return status as StatusBadgeType;
    }
  }

  /**
   * 改善点のステータスをStatusBadgeTypeに変換
   */
  getImprovementStatusBadgeType(status: ImprovementStatus): StatusBadgeType {
    return status as StatusBadgeType;
  }
}

