import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FollowupService } from '../../../../shared/services/followup.service';
import { WeeklyFocusService } from '../../../../shared/services/weekly-focus.service';
import { FollowupItem } from '../../../../shared/models/followup.model';
import { WeeklyFocusResponse } from '../../../../shared/models/weekly-focus.model';
import { FollowupCardComponent } from '../../components/followup-card/followup-card.component';
import { FollowupInputModalComponent } from '../../components/followup-input-modal/followup-input-modal.component';
import {
  ButtonComponent,
  AlertBannerComponent,
  ToastComponent,
  EmptyStateComponent,
} from '../../../../shared/ui';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-followup-list-page',
  standalone: true,
  imports: [
    RouterLink,
    FollowupCardComponent,
    FollowupInputModalComponent,
    ButtonComponent,
    AlertBannerComponent,
    ToastComponent,
    EmptyStateComponent,
  ],
  templateUrl: './followup-list-page.component.html',
  styleUrl: './followup-list-page.component.scss',
})
export class FollowupListPageComponent implements OnInit, OnDestroy {
  // DI
  private readonly followupService = inject(FollowupService);
  private readonly weeklyFocusService = inject(WeeklyFocusService);
  readonly router = inject(Router);

  // 状態管理
  items = signal<FollowupItem[]>([]);
  total = signal(0);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  errorMessage = signal<string | null>(null);

  // モーダル
  selectedItem = signal<FollowupItem | null>(null);
  isModalOpen = signal(false);

  // フィルタ
  statusFilter = signal<string>('未着手,進行中'); // デフォルト: 未完了
  itemTypeFilter = signal<'goodPoint' | 'improvement' | 'すべて'>('すべて');

  // 週次フォーカス
  private weeklyFocusMap = new Map<string, string>(); // key: "itemType-itemId", value: weeklyFocusId
  weeklyFocusCount = signal(0);
  addingToWeeklyFocusItemId = signal<string | null>(null);

  // トースト通知
  toastMessage = signal<string | null>(null);
  toastVariant = signal<'success' | 'error' | 'info'>('success');

  // ページング
  private offset = 0;
  private readonly limit = 20;

  private subscription?: Subscription;

  ngOnInit(): void {
    this.loadItems();
    this.loadWeeklyFocuses();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * セレクトボックスから値を取得（型安全）
   */
  getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  /**
   * 種別フィルタの値を取得（型安全）
   */
  getItemTypeValue(event: Event): 'goodPoint' | 'improvement' | 'すべて' {
    return (event.target as HTMLSelectElement).value as 'goodPoint' | 'improvement' | 'すべて';
  }

  loadItems(reset = true): void {
    if (reset) {
      this.offset = 0;
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }
    this.errorMessage.set(null);

    const status = this.statusFilter();
    const itemTypeValue = this.itemTypeFilter();
    const itemType: 'goodPoint' | 'improvement' | undefined =
      itemTypeValue === 'すべて' ? undefined : itemTypeValue;

    // フォロー項目と週次フォーカスを並列で取得
    const followupItems$ = this.followupService.getFollowupItems({
      status,
      itemType,
      limit: this.limit,
      offset: this.offset,
    });
    const weeklyFocuses$ = this.weeklyFocusService.getCurrentWeekFocuses();

    this.subscription = forkJoin({
      followupItems: followupItems$,
      weeklyFocuses: weeklyFocuses$,
    }).subscribe({
      next: ({ followupItems, weeklyFocuses }) => {
        // 週次フォーカス一覧をMap構造に変換（O(1)判定のため）
        this.updateWeeklyFocusMap(weeklyFocuses);

        if (reset) {
          this.items.set(followupItems.data);
        } else {
          this.items.update((items) => [...items, ...followupItems.data]);
        }
        this.total.set(followupItems.total);
        this.offset += followupItems.data.length;
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.errorMessage.set('フォロー項目の読み込みに失敗しました');
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }

  /**
   * 週次フォーカス一覧を取得
   */
  loadWeeklyFocuses(): void {
    this.subscription = this.weeklyFocusService.getCurrentWeekFocuses().subscribe({
      next: (weeklyFocuses) => {
        this.updateWeeklyFocusMap(weeklyFocuses);
      },
      error: () => {
        // エラー時は既存のMapを維持
      },
    });
  }

  /**
   * 週次フォーカス一覧をMap構造に変換（O(1)判定のため）
   */
  private updateWeeklyFocusMap(weeklyFocuses: WeeklyFocusResponse[]): void {
    this.weeklyFocusMap.clear();
    weeklyFocuses.forEach((focus) => {
      const key = `${focus.itemType}-${focus.itemId}`;
      this.weeklyFocusMap.set(key, focus.id);
    });
    // 週次フォーカスの件数を更新
    this.weeklyFocusCount.set(weeklyFocuses.length);
  }

  /**
   * フォロー項目が週次フォーカスに設定されているか判定
   */
  isInWeeklyFocus(item: FollowupItem): boolean {
    const key = `${item.itemType}-${item.item.id}`;
    return this.weeklyFocusMap.has(key);
  }

  /**
   * 週次フォーカスが最大件数（5件）に達しているか判定
   */
  isWeeklyFocusLimitReached(): boolean {
    return this.weeklyFocusCount() >= 5;
  }

  /**
   * 指定のアイテムが追加中かどうか
   */
  isAddingToWeeklyFocusCheck(item: FollowupItem): boolean {
    const key = `${item.itemType}-${item.item.id}`;
    return this.addingToWeeklyFocusItemId() === key;
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter.set(status);
    this.loadItems();
  }

  onItemTypeFilterChange(itemType: 'goodPoint' | 'improvement' | 'すべて'): void {
    this.itemTypeFilter.set(itemType);
    this.loadItems();
  }

  onLoadMore(): void {
    this.loadItems(false);
  }

  onCardClick(reportId: string): void {
    this.router.navigate(['/daily-reports', reportId]);
  }

  onFollowupClick(item: FollowupItem): void {
    // フォローアップページに遷移
    this.router.navigate(['/followups', item.itemType, item.item.id]);
  }

  onModalClosed(): void {
    this.isModalOpen.set(false);
    this.selectedItem.set(null);
  }

  onModalSaved(): void {
    // フォローアップ保存後、データを再取得してカードのステータスを更新
    this.loadItems(true);
    this.onModalClosed();
  }

  /**
   * 週次フォーカスのIDを取得
   */
  getWeeklyFocusId(item: FollowupItem): string | null {
    const key = `${item.itemType}-${item.item.id}`;
    return this.weeklyFocusMap.get(key) || null;
  }

  /**
   * 週次フォーカスに追加または削除（トグル）
   */
  onToggleWeeklyFocus(item: FollowupItem): void {
    const key = `${item.itemType}-${item.item.id}`;
    const weeklyFocusId = this.weeklyFocusMap.get(key);

    if (weeklyFocusId) {
      // 既にフォーカスに設定されている場合は削除
      this.onRemoveFromWeeklyFocus(item, weeklyFocusId);
    } else {
      // フォーカスに追加
      this.onAddToWeeklyFocus(item);
    }
  }

  /**
   * 週次フォーカスに追加
   */
  onAddToWeeklyFocus(item: FollowupItem): void {
    // 最大件数に達している場合はエラーを表示
    if (this.isWeeklyFocusLimitReached()) {
      this.showToast('今週のフォーカスは最大5件まで設定できます', 'error');
      return;
    }

    this.addingToWeeklyFocusItemId.set(`${item.itemType}-${item.item.id}`);
    this.toastMessage.set(null);

    this.subscription = this.weeklyFocusService
      .addWeeklyFocus({
        itemType: item.itemType,
        itemId: item.item.id,
      })
      .subscribe({
        next: () => {
          // 成功時：トースト通知を表示
          this.showToast('今週のフォーカスに追加しました', 'success');
          // 週次フォーカス一覧を再取得
          this.loadWeeklyFocuses();
          // フォロー項目一覧を更新（各カードのisInWeeklyFocusを更新）
          // リセットして再読み込み（週次フォーカス情報も含めて更新）
          this.loadItems(true);
          // loading状態をリセット
          this.addingToWeeklyFocusItemId.set(null);
        },
        error: (err: { error?: { message?: string } }) => {
          // エラー時：トースト通知でエラーメッセージ表示
          const errorMessage =
            err.error?.message || '週次フォーカスの追加に失敗しました';
          this.showToast(errorMessage, 'error');
          this.addingToWeeklyFocusItemId.set(null);
        },
      });
  }

  /**
   * 週次フォーカスから削除
   */
  onRemoveFromWeeklyFocus(item: FollowupItem, weeklyFocusId: string): void {
    const key = `${item.itemType}-${item.item.id}`;
    this.addingToWeeklyFocusItemId.set(key);
    this.toastMessage.set(null);

    this.subscription = this.weeklyFocusService.deleteWeeklyFocus(weeklyFocusId).subscribe({
      next: () => {
        // 成功時：トースト通知を表示
        this.showToast('今週のフォーカスから削除しました', 'success');
        // 週次フォーカス一覧を再取得
        this.loadWeeklyFocuses();
        // フォロー項目一覧を更新
        this.loadItems(true);
        // loading状態をリセット
        this.addingToWeeklyFocusItemId.set(null);
      },
      error: (err: { error?: { message?: string } }) => {
        // エラー時：トースト通知でエラーメッセージ表示
        const errorMessage =
          err.error?.message || '週次フォーカスの削除に失敗しました';
        this.showToast(errorMessage, 'error');
        // loading状態をリセット
        this.addingToWeeklyFocusItemId.set(null);
      },
    });
  }

  /**
   * トースト通知を表示
   */
  private showToast(message: string, variant: 'success' | 'error' | 'info'): void {
    this.toastMessage.set(message);
    this.toastVariant.set(variant);
    // 3秒後に自動で非表示
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }

  /**
   * トースト通知を閉じる
   */
  onToastDismiss(): void {
    this.toastMessage.set(null);
  }

  get hasMore(): boolean {
    return this.items().length < this.total();
  }

  get isEmpty(): boolean {
    return !this.isLoading() && this.items().length === 0;
  }
}
