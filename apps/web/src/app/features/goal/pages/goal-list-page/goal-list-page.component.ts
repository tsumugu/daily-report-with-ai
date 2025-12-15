import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoalService } from '../../services/goal.service';
import {
  GoalWithChildren,
} from '../../models/goal.model';
import {
  HierarchyTreeNode,
} from '../../../../shared/components/hierarchy-tree-view/hierarchy-tree-view.component';
import {
  HierarchyCardData,
} from '../../../../shared/components/hierarchy-card/hierarchy-card.component';
import {
  ButtonComponent,
  AlertBannerComponent,
  HierarchyTreeViewComponent,
  EmptyStateComponent,
} from '../../../../shared/components';

/**
 * 目標一覧画面コンポーネント
 */
@Component({
  selector: 'app-goal-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    AlertBannerComponent,
    HierarchyTreeViewComponent,
    EmptyStateComponent,
  ],
  templateUrl: './goal-list-page.component.html',
  styleUrl: './goal-list-page.component.scss',
})
export class GoalListPageComponent implements OnInit {
  private readonly goalService = inject(GoalService);
  readonly router = inject(Router);

  // 状態管理
  goals = signal<GoalWithChildren[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  expandedIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.loadGoals();
  }

  /**
   * 目標一覧を取得
   */
  loadGoals(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.goalService.getGoals(true).subscribe({
      next: (response) => {
        const goals = response.data as GoalWithChildren[];
        this.goals.set(goals);
        // 初期状態ですべての階層を展開
        const allIds = new Set<string>();
        const collectIds = (goals: GoalWithChildren[]): void => {
          goals.forEach((goal) => {
            allIds.add(goal.id);
            if (goal.children && goal.children.length > 0) {
              collectIds(goal.children);
            }
          });
        };
        collectIds(goals);
        this.expandedIds.set(allIds);
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
   * 目標クリック時
   */
  onGoalClick(goalId: string): void {
    this.router.navigate(['/goals', goalId]);
  }

  /**
   * 展開/折りたたみ切り替え
   */
  onExpandToggle(nodeId: string): void {
    const expanded = new Set(this.expandedIds());
    if (expanded.has(nodeId)) {
      expanded.delete(nodeId);
    } else {
      expanded.add(nodeId);
    }
    this.expandedIds.set(expanded);
  }

  /**
   * 子目標作成
   * プラスボタンを押した目標の親目標（上位目標）を自動的に設定する
   */
  onCreateChild(goalId: string): void {
    // プラスボタンを押した目標を取得
    const clickedGoal = this.findGoalById(goalId, this.goals());
    if (!clickedGoal) {
      // 目標が見つからない場合は、親目標なしで新規作成画面に遷移
      this.router.navigate(['/goals/new']);
      return;
    }

    // プラスボタンを押した目標の親目標IDを取得
    const parentId = clickedGoal.parentId || null;

    // 親目標IDをクエリパラメータとして渡す
    if (parentId) {
      this.router.navigate(['/goals/new'], { queryParams: { parentId } });
    } else {
      // 親目標がない場合は、親目標なしで新規作成画面に遷移
      this.router.navigate(['/goals/new']);
    }
  }

  /**
   * GoalWithChildrenをHierarchyTreeNodeに変換
   */
  convertToTreeNodes(goals: GoalWithChildren[]): HierarchyTreeNode[] {
    return goals.map((goal) => this.convertGoalToNode(goal));
  }

  /**
   * GoalをHierarchyTreeNodeに変換
   */
  private convertGoalToNode(goal: GoalWithChildren): HierarchyTreeNode {
    const cardData: HierarchyCardData = {
      id: goal.id,
      title: goal.name,
      subtitle: goal.description ? goal.description : undefined,
      metadata: goal.startDate && goal.endDate ? `${goal.startDate} 〜 ${goal.endDate}` : undefined,
      level: this.getGoalLevel(goal),
      type: goal.goalType ? goal.goalType : undefined,
    };

    return {
      id: goal.id,
      data: cardData,
      children: goal.children.map((child) => this.convertGoalToNode(child)),
    };
  }

  /**
   * 目標の階層レベルを取得
   * 階層の深さに基づいて判定（深さ1=長期、深さ2=中期、深さ3以上=短期）
   */
  private getGoalLevel(goal: GoalWithChildren): 'long' | 'medium' | 'short' {
    const depth = this.calculateDepth(goal, this.goals());
    if (depth === 1) {
      return 'long';
    } else if (depth === 2) {
      return 'medium';
    } else {
      return 'short';
    }
  }

  /**
   * 目標の階層の深さを計算（再帰的）
   */
  private calculateDepth(goal: GoalWithChildren, allGoals: GoalWithChildren[]): number {
    if (!goal.parentId) {
      return 1;
    }
    const parent = this.findGoalById(goal.parentId, allGoals);
    if (!parent) {
      return 1;
    }
    return 1 + this.calculateDepth(parent, allGoals);
  }

  /**
   * 目標IDから目標を検索（階層構造全体から検索）
   */
  private findGoalById(goalId: string, goals: GoalWithChildren[]): GoalWithChildren | null {
    for (const goal of goals) {
      if (goal.id === goalId) {
        return goal;
      }
      if (goal.children && goal.children.length > 0) {
        const found = this.findGoalById(goalId, goal.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * 目標が空かどうか
   */
  get isEmpty(): boolean {
    return !this.isLoading() && this.goals().length === 0;
  }
}

