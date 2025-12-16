import { Component, Input, Output, EventEmitter, OnInit, signal, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { GoalService } from '../../../features/goal/services/goal.service';
import { Goal } from '../../../features/goal/models/goal.model';
import { IconComponent } from '../icon';
import { GoalChipComponent } from '../goal-chip';

/**
 * 目標選択オプション（階層情報を含む）
 */
export interface GoalSelectOption {
  id: string;
  name: string;
  parentName: string | null;
  startDate: string;
  endDate: string;
  parentId: string | null;
}

@Component({
  selector: 'app-goal-multi-select-field',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, GoalChipComponent],
  templateUrl: './goal-multi-select-field.component.html',
  styleUrl: './goal-multi-select-field.component.scss',
})
export class GoalMultiSelectFieldComponent implements OnInit {
  @Input() value: string[] = [];
  @Input() label = '関連する目標';
  @Input() placeholder = '目標を選択';
  @Input() disabled = false;
  @Input() error = '';
  @Input() helperText = '';
  @Input() maxSelection = 10;

  @Output() valueChange = new EventEmitter<string[]>();

  private readonly goalService = inject(GoalService);
  private readonly elementRef = inject(ElementRef);

  // 状態管理
  allGoals = signal<Goal[]>([]);
  filteredGoals = signal<GoalSelectOption[]>([]);
  searchQuery = signal('');
  isOpen = signal(false);
  isLoading = signal(false);

  // デバウンス用のSubject
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadGoals();

    // 検索クエリのデバウンス処理（300ms）
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        this.filterGoals(query);
      });
  }

  /**
   * 目標一覧を取得
   */
  loadGoals(): void {
    this.isLoading.set(true);
    this.goalService.getGoals(false).subscribe({
      next: (response) => {
        const goals = response.data as Goal[];
        this.allGoals.set(goals);
        this.filterGoals('');
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  /**
   * 目標をフィルタリング
   */
  filterGoals(query: string): void {
    const goals = this.allGoals();
    const selectedIds = new Set(this.value);

    const filtered = goals
      .filter((goal) => {
        // 既に選択されている目標は除外
        if (selectedIds.has(goal.id)) {
          return false;
        }
        // 検索クエリでフィルタリング
        if (query.trim()) {
          return goal.name.toLowerCase().includes(query.toLowerCase());
        }
        return true;
      })
      .map((goal) => {
        // 親目標名を取得
        const parentName = goal.parentId
          ? goals.find((g) => g.id === goal.parentId)?.name || null
          : null;

        return {
          id: goal.id,
          name: goal.name,
          parentName,
          startDate: goal.startDate,
          endDate: goal.endDate,
          parentId: goal.parentId,
        };
      });

    this.filteredGoals.set(filtered);
  }

  /**
   * 検索クエリ変更時
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  /**
   * 目標を選択
   */
  selectGoal(goalId: string): void {
    if (this.disabled || this.value.length >= this.maxSelection) {
      return;
    }

    const newValue = [...this.value, goalId];
    this.value = newValue;
    this.valueChange.emit(newValue);
    this.searchQuery.set('');
    this.filterGoals('');
    // 選択後はドロップダウンを開いたままにする（ユーザーが続けて選択できるように）
  }

  /**
   * 目標を削除
   */
  removeGoal(goalId: string): void {
    if (this.disabled) {
      return;
    }

    const newValue = this.value.filter((id) => id !== goalId);
    this.value = newValue;
    this.valueChange.emit(newValue);
    this.filterGoals(this.searchQuery());
  }

  /**
   * 選択された目標の詳細情報を取得
   */
  getSelectedGoals(): GoalSelectOption[] {
    const goals = this.allGoals();
    return this.value
      .map((id) => {
        const goal = goals.find((g) => g.id === id);
        if (!goal) return null;

        const parentName = goal.parentId
          ? goals.find((g) => g.id === goal.parentId)?.name || null
          : null;

        return {
          id: goal.id,
          name: goal.name,
          parentName,
          startDate: goal.startDate,
          endDate: goal.endDate,
          parentId: goal.parentId,
        };
      })
      .filter((g): g is GoalSelectOption => g !== null);
  }

  /**
   * ドロップダウンを開く/閉じる
   */
  toggleDropdown(): void {
    if (this.disabled) {
      return;
    }
    this.isOpen.update((v) => !v);
    if (!this.isOpen()) {
      this.searchQuery.set('');
      this.filterGoals('');
    }
  }

  /**
   * ドロップダウンを閉じる
   */
  closeDropdown(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.filterGoals('');
  }

  /**
   * ドキュメントクリック時にドロップダウンを閉じる
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const element = this.elementRef.nativeElement;
    if (this.isOpen() && element && !element.contains(target)) {
      this.closeDropdown();
    }
  }

  /**
   * 目標の表示ラベル（親目標名を含む）
   */
  getGoalLabel(goal: GoalSelectOption): string {
    if (goal.parentName) {
      return `${goal.parentName} > ${goal.name}`;
    }
    return goal.name;
  }

  get hasError(): boolean {
    return !!this.error;
  }

  get isMaxSelectionReached(): boolean {
    return this.value.length >= this.maxSelection;
  }
}

