import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoalService } from '../../services/goal.service';
import {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
} from '../../models/goal.model';
import {
  ButtonComponent,
  InputFieldComponent,
  TextareaFieldComponent,
  DateFieldComponent,
  EntitySelectFieldComponent,
  EntitySelectOption,
  AlertBannerComponent,
  ToastComponent,
} from '../../../../shared/components';

/**
 * 目標作成・編集画面コンポーネント
 */
@Component({
  selector: 'app-goal-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputFieldComponent,
    TextareaFieldComponent,
    DateFieldComponent,
    EntitySelectFieldComponent,
    AlertBannerComponent,
    ToastComponent,
  ],
  templateUrl: './goal-form-page.component.html',
  styleUrl: './goal-form-page.component.scss',
})
export class GoalFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly goalService = inject(GoalService);
  private readonly cdr = inject(ChangeDetectorRef);

  // 状態管理
  isEditMode = signal(false);
  goalId = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  parentGoalOptions = signal<EntitySelectOption[]>([]);
  goalTypeOptions: EntitySelectOption[] = [
    { id: 'skill', label: 'スキル習得' },
    { id: 'project', label: 'プロジェクト完了' },
    { id: 'habit', label: '習慣形成' },
    { id: 'other', label: 'その他' },
  ];

  // トースト通知
  toastMessage = signal<string | null>(null);
  toastVariant = signal<'success' | 'error' | 'info'>('success');

  // フォーム
  form: FormGroup;

  // 文字数制限
  readonly MAX_NAME_LENGTH = 100;
  readonly MAX_DESCRIPTION_LENGTH = 1000;
  readonly MAX_SUCCESS_CRITERIA_LENGTH = 500;

  private pendingParentId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(this.MAX_NAME_LENGTH)]],
      description: ['', [Validators.maxLength(this.MAX_DESCRIPTION_LENGTH)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      parentId: [null],
      goalType: [null],
      successCriteria: ['', [Validators.maxLength(this.MAX_SUCCESS_CRITERIA_LENGTH)]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.goalId.set(id);
      this.loadGoal(id);
    } else {
      // 新規作成モードの場合、クエリパラメータのparentIdを取得して保留
      const parentId = this.route.snapshot.queryParamMap.get('parentId');
      if (parentId && parentId.trim() !== '') {
        this.pendingParentId = parentId.trim();
      }
    }

    // 親目標オプションを読み込む（読み込み完了後にparentIdが自動設定される）
    this.loadParentGoalOptions();
  }

  /**
   * 目標を読み込む（編集モード）
   */
  loadGoal(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.goalService.getGoal(id).subscribe({
      next: (goal) => {
        this.form.patchValue({
          name: goal.name,
          description: goal.description || '',
          startDate: goal.startDate,
          endDate: goal.endDate,
          parentId: goal.parentId,
          goalType: goal.goalType,
          successCriteria: goal.successCriteria || '',
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || '目標の取得に失敗しました'
        );
        this.isLoading.set(false);
      },
    });
  }

  /**
   * 親目標のオプションを読み込む
   */
  loadParentGoalOptions(): void {
    this.goalService.getGoals(true).subscribe({
      next: (response) => {
        const goals = response.data as Goal[];
        const options: EntitySelectOption[] = [
          { id: '', label: 'なし' },
        ];

        // フラットなリストに変換
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flattenGoals = (goals: any[]): any[] => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any[] = [];
          for (const goal of goals) {
            result.push(goal);
            if (goal.children && goal.children.length > 0) {
              result.push(...flattenGoals(goal.children));
            }
          }
          return result;
        };

        const flatGoals = flattenGoals(goals);
        for (const goal of flatGoals) {
          // 編集モードの場合、現在の目標とその子孫を除外
          if (this.isEditMode() && this.goalId()) {
            if (goal.id === this.goalId()) {
              continue;
            }
            // 子孫チェック（簡易版）
            if (this.isDescendant(goal.id, this.goalId()!, flatGoals)) {
              continue;
            }
          }
          options.push({
            id: goal.id,
            label: goal.name,
          });
        }

        this.parentGoalOptions.set(options);

        // オプション読み込み完了後、保留中のparentIdを設定（新規作成モードのみ）
        if (!this.isEditMode() && this.pendingParentId) {
          // pendingParentIdを変数に保存（非同期処理で参照するため）
          const parentIdToSet = this.pendingParentId;
          const optionExists = options.some((option) => option.id === parentIdToSet);
          if (optionExists) {
            // 変更検知をトリガーしてから値を設定
            this.cdr.detectChanges();
            // 次のマイクロタスクで値を設定（オプションの更新を確実に待つ）
            Promise.resolve().then(() => {
              this.form.patchValue({ parentId: parentIdToSet });
              this.cdr.detectChanges();
            });
            this.pendingParentId = null;
          } else {
            this.pendingParentId = null;
          }
        }
      },
      error: () => {
        // エラー時は空のオプションを設定
        this.parentGoalOptions.set([{ id: '', label: 'なし' }]);
      },
    });
  }

  /**
   * 子孫かどうかをチェック（簡易版）
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isDescendant(goalId: string, ancestorId: string, goals: any[]): boolean {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || !goal.parentId) {
      return false;
    }
    if (goal.parentId === ancestorId) {
      return true;
    }
    return this.isDescendant(goal.parentId, ancestorId, goals);
  }

  /**
   * フォーム送信
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.value;
    const request: CreateGoalRequest | UpdateGoalRequest = {
      name: formValue.name,
      description: formValue.description || null,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      parentId: formValue.parentId || null,
      goalType: formValue.goalType || null,
      successCriteria: formValue.successCriteria || null,
    };

    if (this.isEditMode() && this.goalId()) {
      // 更新
      this.goalService.updateGoal(this.goalId()!, request as UpdateGoalRequest).subscribe({
        next: () => {
          this.showToast('目標を更新しました', 'success');
          this.router.navigate(['/goals', this.goalId()]);
        },
        error: (error) => {
          this.errorMessage.set(
            error.error?.message || '目標の更新に失敗しました'
          );
          this.isLoading.set(false);
        },
      });
    } else {
      // 作成
      this.goalService.createGoal(request as CreateGoalRequest).subscribe({
        next: (goal) => {
          this.showToast('目標を作成しました', 'success');
          this.router.navigate(['/goals', goal.id]);
        },
        error: (error) => {
          this.errorMessage.set(
            error.error?.message || '目標の作成に失敗しました'
          );
          this.isLoading.set(false);
        },
      });
    }
  }

  /**
   * キャンセル
   */
  onCancel(): void {
    if (this.isEditMode() && this.goalId()) {
      this.router.navigate(['/goals', this.goalId()]);
    } else {
      this.router.navigate(['/goals']);
    }
  }

  /**
   * トースト通知を表示
   */
  private showToast(message: string, variant: 'success' | 'error' | 'info'): void {
    this.toastMessage.set(message);
    this.toastVariant.set(variant);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }

  /**
   * エラーメッセージを取得
   */
  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return `${this.getFieldLabel(controlName)}を入力してください`;
      }
      if (control.errors?.['maxlength']) {
        const maxLength = control.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(controlName)}は${maxLength}文字以内で入力してください`;
      }
    }
    return '';
  }

  /**
   * フィールドラベルを取得
   */
  private getFieldLabel(controlName: string): string {
    const labels: Record<string, string> = {
      name: '目標名',
      description: '目標の説明',
      startDate: '開始日',
      endDate: '終了日',
      successCriteria: '達成基準',
    };
    return labels[controlName] || controlName;
  }

  /**
   * 文字数カウント
   */
  getCharacterCount(controlName: string): number {
    const control = this.form.get(controlName);
    return control?.value?.length || 0;
  }

  /**
   * 最大文字数
   */
  getMaxLength(controlName: string): number {
    const maxLengths: Record<string, number> = {
      name: this.MAX_NAME_LENGTH,
      description: this.MAX_DESCRIPTION_LENGTH,
      successCriteria: this.MAX_SUCCESS_CRITERIA_LENGTH,
    };
    return maxLengths[controlName] || 0;
  }
}

