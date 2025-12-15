import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GoalService } from '../../services/goal.service';
import { GoalDetailResponse } from '../../models/goal.model';
import {
  ButtonComponent,
  AlertBannerComponent,
  ToastComponent,
  HierarchyCardComponent,
  HierarchyCardData,
} from '../../../../shared/components';

/**
 * 目標詳細画面コンポーネント
 */
@Component({
  selector: 'app-goal-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    AlertBannerComponent,
    ToastComponent,
    HierarchyCardComponent,
  ],
  templateUrl: './goal-detail-page.component.html',
  styleUrl: './goal-detail-page.component.scss',
})
export class GoalDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly goalService = inject(GoalService);

  // 状態管理
  goal = signal<GoalDetailResponse | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isDeleting = signal(false);

  // トースト通知
  toastMessage = signal<string | null>(null);
  toastVariant = signal<'success' | 'error' | 'info'>('success');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGoal(id);
    }
  }

  /**
   * 目標を読み込む
   */
  loadGoal(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.goalService.getGoal(id).subscribe({
      next: (goal) => {
        this.goal.set(goal);
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
   * 目標を削除
   */
  onDelete(): void {
    const goal = this.goal();
    if (!goal) {
      return;
    }

    if (!confirm('この目標を削除しますか？下位目標が存在する場合は削除できません。')) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.goalService.deleteGoal(goal.id).subscribe({
      next: () => {
        this.showToast('目標を削除しました', 'success');
        this.router.navigate(['/goals']);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || '目標の削除に失敗しました'
        );
        this.isDeleting.set(false);
      },
    });
  }

  /**
   * 下位目標を作成
   */
  onCreateChild(): void {
    const goal = this.goal();
    if (!goal) {
      return;
    }
    this.router.navigate(['/goals/new'], {
      queryParams: { parentId: goal.id },
    });
  }

  /**
   * 目標を編集
   */
  onEdit(): void {
    const goal = this.goal();
    if (!goal) {
      return;
    }
    this.router.navigate(['/goals', goal.id, 'edit']);
  }

  /**
   * 目標の性質ラベルを取得
   */
  getGoalTypeLabel(goalType: string | null): string {
    const labels: Record<string, string> = {
      skill: 'スキル習得',
      project: 'プロジェクト完了',
      habit: '習慣形成',
      other: 'その他',
    };
    return goalType ? labels[goalType] || goalType : '-';
  }

  /**
   * 階層レベルを取得
   */
  getGoalLevel(): 'long' | 'medium' | 'short' {
    const goal = this.goal();
    if (!goal) {
      return 'long';
    }
    // 簡易版：parentIdがnullなら長期目標
    if (!goal.parentId) {
      return 'long';
    }
    // より正確な判定が必要な場合は、階層の深さを計算する
    return 'medium';
  }

  /**
   * 下位目標のカードデータを取得
   */
  getChildCardData(child: { id: string; name: string }): HierarchyCardData {
    return {
      id: child.id,
      title: child.name,
    };
  }

  /**
   * 短期目標かどうか（最下位階層かどうか）
   */
  get isShortTermGoal(): boolean {
    const goal = this.goal();
    if (!goal) {
      return false;
    }
    // 下位目標が存在しない場合は短期目標
    return goal.children.length === 0;
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
}

