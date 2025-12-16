import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DailyReportService } from '../../services/daily-report.service';
import { GoodPointForm, ImprovementForm, CreateDailyReportRequest, DailyReport } from '../../models/daily-report.model';
import {
  ButtonComponent,
  AlertBannerComponent,
  DateFieldComponent,
  TextareaFieldComponent,
  FormCardComponent,
  IconComponent,
  GoalMultiSelectFieldComponent,
} from '../../../../shared/components';

@Component({
  selector: 'app-daily-report-edit-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    AlertBannerComponent,
    DateFieldComponent,
    TextareaFieldComponent,
    FormCardComponent,
    IconComponent,
    GoalMultiSelectFieldComponent,
  ],
  templateUrl: './daily-report-edit-page.component.html',
  styleUrl: './daily-report-edit-page.component.scss',
})
export class DailyReportEditPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dailyReportService = inject(DailyReportService);

  form: FormGroup;

  // よかったこと・改善点の配列（リアクティブ）
  goodPoints = signal<GoodPointForm[]>([]);
  improvements = signal<ImprovementForm[]>([]);
  
  // 選択された目標のIDリスト
  selectedGoalIds = signal<string[]>([]);

  // 状態管理
  reportId: string | null = null;
  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  isSubmitted = signal(false);

  // 文字数カウント
  readonly MAX_LENGTH = 1000;

  constructor() {
    this.form = this.fb.group({
      date: ['', [Validators.required]],
      events: ['', [Validators.required, Validators.maxLength(this.MAX_LENGTH)]],
      learnings: ['', [Validators.maxLength(this.MAX_LENGTH)]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportId = id;
      this.loadReport(id);
    } else {
      this.errorMessage.set('日報IDが指定されていません');
      this.isLoading.set(false);
    }
  }

  /**
   * 日報詳細を取得してフォームに設定
   */
  loadReport(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dailyReportService.getById(id).subscribe({
      next: (report: DailyReport) => {
        // フォームに既存データを設定
        this.form.patchValue({
          date: report.date,
          events: report.events,
          learnings: report.learnings || '',
        });

        // よかったこと・改善点を設定
        this.goodPoints.set(
          report.goodPoints.map((gp) => ({
            content: gp.content,
            factors: gp.factors || '',
          }))
        );
        this.improvements.set(
          report.improvements.map((imp) => ({
            content: imp.content,
            action: imp.action || '',
          }))
        );
        
        // 関連目標を設定
        this.selectedGoalIds.set(report.goals.map((g) => g.id));

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
   * よかったことを追加
   */
  addGoodPoint(): void {
    this.goodPoints.update((gps) => [...gps, { content: '', factors: '' }]);
  }

  /**
   * よかったことを削除
   */
  removeGoodPoint(index: number): void {
    this.goodPoints.update((gps) => gps.filter((_, i) => i !== index));
  }

  /**
   * よかったことを更新
   */
  updateGoodPoint(index: number, field: keyof GoodPointForm, value: string): void {
    this.goodPoints.update((gps) =>
      gps.map((gp, i) => (i === index ? { ...gp, [field]: value } : gp))
    );
  }

  /**
   * 改善点を追加
   */
  addImprovement(): void {
    this.improvements.update((imps) => [...imps, { content: '', action: '' }]);
  }

  /**
   * 改善点を削除
   */
  removeImprovement(index: number): void {
    this.improvements.update((imps) => imps.filter((_, i) => i !== index));
  }

  /**
   * 改善点を更新
   */
  updateImprovement(index: number, field: keyof ImprovementForm, value: string): void {
    this.improvements.update((imps) =>
      imps.map((imp, i) => (i === index ? { ...imp, [field]: value } : imp))
    );
  }

  /**
   * キャンセルボタンクリック
   */
  onCancel(): void {
    this.router.navigate(['/daily-reports', this.reportId]);
  }

  /**
   * フォーム送信
   */
  onSubmit(): void {
    this.isSubmitted.set(true);
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.reportId) {
      this.errorMessage.set('日報IDが指定されていません');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const request: CreateDailyReportRequest = {
      date: this.form.get('date')?.value as string,
      events: this.form.get('events')?.value as string,
      learnings: (this.form.get('learnings')?.value as string) || undefined,
      goalIds: this.selectedGoalIds().length > 0 ? this.selectedGoalIds() : undefined,
      goodPoints: this.goodPoints()
        .filter((gp) => gp.content.trim())
        .map((gp) => ({
          content: gp.content,
          factors: gp.factors || undefined,
        })),
      improvements: this.improvements()
        .filter((imp) => imp.content.trim())
        .map((imp) => ({
          content: imp.content,
          action: imp.action || undefined,
        })),
    };

    this.dailyReportService.update(this.reportId, request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/daily-reports', this.reportId]);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          err.error?.message || '日報の更新に失敗しました。もう一度お試しください。'
        );
      },
    });
  }

  /**
   * フィールドエラーメッセージを取得
   */
  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) {
      return null;
    }

    // touched状態または送信済みの場合のみエラーを返す
    if (!control.touched && !this.isSubmitted()) {
      return null;
    }

    if (control.errors['required']) {
      return 'この項目は必須です';
    }
    if (control.errors['maxlength']) {
      return `${this.MAX_LENGTH}文字以内で入力してください`;
    }
    return null;
  }
}

