import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FollowupService } from '../../../../shared/services/followup.service';
import { FollowupItem } from '../../../../shared/models/followup.model';
import { FollowupCardComponent } from '../../components/followup-card/followup-card.component';
import { FollowupInputModalComponent } from '../../components/followup-input-modal/followup-input-modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-followup-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FollowupCardComponent,
    FollowupInputModalComponent,
    ButtonComponent,
    AlertBannerComponent,
  ],
  templateUrl: './followup-list-page.component.html',
  styleUrl: './followup-list-page.component.scss',
})
export class FollowupListPageComponent implements OnInit, OnDestroy {
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

  // ページング
  private offset = 0;
  private readonly limit = 20;

  private subscription?: Subscription;

  readonly router = inject(Router);

  constructor(private followupService: FollowupService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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

    this.subscription = this.followupService
      .getFollowupItems({
        status,
        itemType,
        limit: this.limit,
        offset: this.offset,
      })
      .subscribe({
        next: (response) => {
          if (reset) {
            this.items.set(response.data);
          } else {
            this.items.update((items) => [...items, ...response.data]);
          }
          this.total.set(response.total);
          this.offset += response.data.length;
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        },
        error: (_err) => {
          this.errorMessage.set('フォロー項目の読み込みに失敗しました');
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        },
      });
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
    this.selectedItem.set(item);
    this.isModalOpen.set(true);
  }

  onModalClosed(): void {
    this.isModalOpen.set(false);
    this.selectedItem.set(null);
  }

  onModalSaved(): void {
    this.loadItems();
    this.onModalClosed();
  }

  get hasMore(): boolean {
    return this.items().length < this.total();
  }

  get isEmpty(): boolean {
    return !this.isLoading() && this.items().length === 0;
  }
}

