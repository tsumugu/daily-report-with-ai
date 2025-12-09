import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DailyReportService } from '../../services/daily-report.service';
import { GoodPointForm, ImprovementForm, CreateDailyReportRequest } from '../../models/daily-report.model';
import {
  ButtonComponent,
  AlertBannerComponent,
  DateFieldComponent,
  TextareaFieldComponent,
  FormCardComponent,
  IconComponent,
} from '../../../../shared/components';

@Component({
  selector: 'app-daily-report-input-page',
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
  ],
  templateUrl: './daily-report-input-page.component.html',
  styleUrl: './daily-report-input-page.component.scss',
})
export class DailyReportInputPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dailyReportService = inject(DailyReportService);

  form: FormGroup;

  // よかったこと・改善点の配列（リアクティブ）
  goodPoints = signal<GoodPointForm[]>([]);
  improvements = signal<ImprovementForm[]>([]);

  // 状態管理
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isSubmitted = signal(false);

  // 文字数カウント
  readonly MAX_LENGTH = 1000;

  constructor() {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      date: [today, [Validators.required]],
      events: ['', [Validators.required, Validators.maxLength(this.MAX_LENGTH)]],
      learnings: ['', [Validators.maxLength(this.MAX_LENGTH)]],
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
   * フォーム送信
   */
  onSubmit(): void {
    this.isSubmitted.set(true);
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request: CreateDailyReportRequest = {
      date: this.form.get('date')?.value as string,
      events: this.form.get('events')?.value as string,
      learnings: (this.form.get('learnings')?.value as string) || undefined,
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

    this.dailyReportService.create(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/daily-reports']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || '日報の保存に失敗しました。もう一度お試しください。'
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
