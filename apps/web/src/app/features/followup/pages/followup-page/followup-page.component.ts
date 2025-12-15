import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FollowupService } from '../../../../shared/services/followup.service';
import { Episode, Action, EpisodesResponse, ActionsResponse } from '../../../../shared/models/followup.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DateFieldComponent } from '../../../../shared/components/date-field/date-field.component';
import { TextareaFieldComponent } from '../../../../shared/components/textarea-field/textarea-field.component';
import { StatusBadgeComponent, StatusBadgeType } from '../../../../shared/components/status-badge/status-badge.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-followup-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    DateFieldComponent,
    TextareaFieldComponent,
    StatusBadgeComponent,
    ToastComponent,
    IconComponent,
    EmptyStateComponent,
  ],
  templateUrl: './followup-page.component.html',
  styleUrl: './followup-page.component.scss',
})
export class FollowupPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly followupService = inject(FollowupService);

  // ルートパラメータ
  itemType = signal<'goodPoint' | 'improvement'>('goodPoint');
  itemId = signal<string>('');

  // エピソード/アクション一覧
  episodes = signal<Episode[]>([]);
  actions = signal<Action[]>([]);
  count = signal(0);
  status = signal<string>('未着手');

  // フォーム
  form: FormGroup;
  isModalOpen = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  editingFollowupId = signal<string | null>(null);

  // トースト通知
  toastMessage = signal<string | null>(null);
  toastVariant = signal<'success' | 'error' | 'info'>('success');

  private subscription?: Subscription;
  private loadSubscription?: Subscription;

  constructor() {
    this.form = this.fb.group({
      date: ['', Validators.required],
      memo: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    // ルートパラメータを取得
    const itemTypeParam = this.route.snapshot.paramMap.get('itemType');
    const itemIdParam = this.route.snapshot.paramMap.get('itemId');

    if (itemTypeParam && (itemTypeParam === 'goodPoint' || itemTypeParam === 'improvement')) {
      this.itemType.set(itemTypeParam);
    }
    if (itemIdParam) {
      this.itemId.set(itemIdParam);
    }

    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.loadSubscription?.unsubscribe();
  }

  /**
   * エピソード/アクション一覧を取得
   */
  loadData(): void {
    const itemType = this.itemType();
    const itemId = this.itemId();

    if (!itemId) {
      this.errorMessage.set('項目IDが指定されていません');
      return;
    }

    // 既存のsubscriptionをunsubscribe（loadData用のsubscriptionのみ）
    // onSubmitのsubscriptionは保持するため、loadData専用のsubscriptionを管理
    const previousLoadSubscription = this.loadSubscription;
    if (previousLoadSubscription) {
      previousLoadSubscription.unsubscribe();
    }

    if (itemType === 'goodPoint') {
      this.loadSubscription = this.followupService.getEpisodes(itemId).subscribe({
        next: (response: EpisodesResponse) => {
          this.episodes.set(response.data);
          this.count.set(response.count);
          this.status.set(response.status);
          this.errorMessage.set(null);
        },
        error: () => {
          this.errorMessage.set('エピソードの読み込みに失敗しました');
        },
      });
    } else {
      this.loadSubscription = this.followupService.getActions(itemId).subscribe({
        next: (response: ActionsResponse) => {
          this.actions.set(response.data);
          this.count.set(response.count);
          this.status.set(response.status);
          this.errorMessage.set(null);
        },
        error: () => {
          this.errorMessage.set('アクションの読み込みに失敗しました');
        },
      });
    }
  }

  /**
   * ページタイトルを取得
   */
  get pageTitle(): string {
    return this.itemType() === 'goodPoint' ? 'よかったことのフォローアップ' : '改善点のフォローアップ';
  }

  /**
   * セクションタイトルを取得
   */
  get sectionTitle(): string {
    return this.itemType() === 'goodPoint' ? '再現エピソード' : '実施アクション';
  }

  /**
   * ステータス表示テキストを取得
   */
  get statusText(): string {
    const count = this.count();
    const status = this.status();
    const countLabel = this.itemType() === 'goodPoint' ? 'エピソード' : 'アクション';
    return `${countLabel}: ${count}回 ${status}`;
  }

  /**
   * ステータスバッジタイプを取得
   */
  get statusBadgeType(): StatusBadgeType | undefined {
    const status = this.status();
    return status as StatusBadgeType | undefined;
  }

  /**
   * モーダルタイトルを取得
   */
  get modalTitle(): string {
    const isEditing = this.editingFollowupId() !== null;
    if (this.itemType() === 'goodPoint') {
      return isEditing ? 'エピソードを編集' : 'エピソードを追加';
    } else {
      return isEditing ? 'アクションを編集' : 'アクションを追加';
    }
  }

  /**
   * 日付ラベルを取得
   */
  get dateLabel(): string {
    return this.itemType() === 'goodPoint' ? '再現日' : 'アクションをした日';
  }

  /**
   * 日付フィールドのエラーメッセージを取得
   */
  get dateErrorMessage(): string {
    const dateControl = this.form.get('date');
    if (dateControl?.hasError('required') && dateControl?.touched) {
      return `${this.dateLabel}は必須です`;
    }
    return '';
  }

  /**
   * 日付フィールドがtouchedかどうか
   */
  get dateTouched(): boolean {
    return this.form.get('date')?.touched ?? false;
  }

  /**
   * メモフィールドのエラーメッセージを取得
   */
  get memoErrorMessage(): string {
    const memoControl = this.form.get('memo');
    if (memoControl?.hasError('maxlength') && memoControl?.touched) {
      return 'メモは500文字以内で入力してください';
    }
    return '';
  }

  /**
   * メモフィールドがtouchedかどうか
   */
  get memoTouched(): boolean {
    return this.form.get('memo')?.touched ?? false;
  }

  /**
   * メモラベルを取得
   */
  get memoLabel(): string {
    return this.itemType() === 'goodPoint' ? '再現メモ' : '進捗メモ';
  }

  /**
   * メモプレースホルダーを取得
   */
  get memoPlaceholder(): string {
    return this.itemType() === 'goodPoint'
      ? 'どのように再現したか記録してください'
      : 'どのようなアクションを実施したか記録してください';
  }

  /**
   * エピソード/アクション追加ボタンクリック
   */
  onAddClick(): void {
    this.editingFollowupId.set(null);
    this.form.reset();
    this.errorMessage.set(null);
    this.isModalOpen.set(true);
  }

  /**
   * エピソード/アクション編集ボタンクリック
   */
  onEditClick(followupId: string): void {
    const itemType = this.itemType();
    let followup: Episode | Action | undefined;

    if (itemType === 'goodPoint') {
      followup = this.episodes().find((ep) => ep.id === followupId);
    } else {
      followup = this.actions().find((act) => act.id === followupId);
    }

    if (followup) {
      this.editingFollowupId.set(followupId);
      this.form.patchValue({
        date: followup.date,
        memo: followup.memo || '',
      });
      this.errorMessage.set(null);
      this.isModalOpen.set(true);
    }
  }

  /**
   * モーダルを閉じる
   */
  onCloseModal(): void {
    this.isModalOpen.set(false);
    this.form.reset();
    this.errorMessage.set(null);
    this.editingFollowupId.set(null);
  }

  /**
   * フォーム送信
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.value;
    const itemId = this.itemId();
    const itemType = this.itemType();
    const editingId = this.editingFollowupId();

    const requestData = {
      date: formValue.date,
      memo: formValue.memo || undefined,
    };

    const observable = editingId
      ? itemType === 'goodPoint'
        ? this.followupService.updateEpisode(itemId, editingId, requestData)
        : this.followupService.updateAction(itemId, editingId, requestData)
      : itemType === 'goodPoint'
        ? this.followupService.addEpisode(itemId, requestData)
        : this.followupService.addAction(itemId, requestData);

    const submitSubscription = observable.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // モーダルを先に閉じる（確実に閉じるために即座に実行）
        this.isModalOpen.set(false);
        this.form.reset();
        this.errorMessage.set(null);
        this.editingFollowupId.set(null);
        // データを読み込む（非同期で実行し、エラーが発生してもモーダルは閉じたまま）
        setTimeout(() => {
          try {
            this.loadData();
          } catch (error) {
            // loadData()でエラーが発生してもモーダルは閉じたまま
            // このcatchブロックは、loadData()内で同期的なエラーが発生した場合に備えたもの
            // 通常はsubscribeのerrorコールバックで処理されるため、このブロックは実行されない
            console.error('データの読み込みに失敗しました:', error);
          }
        }, 0);
        const isEditing = editingId !== null;
        this.showToast(
          isEditing
            ? itemType === 'goodPoint'
              ? 'エピソードを更新しました'
              : 'アクションを更新しました'
            : itemType === 'goodPoint'
              ? 'エピソードを追加しました'
              : 'アクションを追加しました',
          'success'
        );
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage.set(
          err.error?.message ||
            (itemType === 'goodPoint' ? 'エピソードの追加に失敗しました' : 'アクションの追加に失敗しました')
        );
        this.isSubmitting.set(false);
      },
    });
    // 既存のsubscriptionをunsubscribeしてから新しいsubscriptionを設定
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = submitSubscription;
  }

  /**
   * エピソード/アクション削除
   */
  onDelete(episodeOrActionId: string): void {
    const itemId = this.itemId();
    const itemType = this.itemType();

    const observable =
      itemType === 'goodPoint'
        ? this.followupService.deleteEpisode(itemId, episodeOrActionId)
        : this.followupService.deleteAction(itemId, episodeOrActionId);

    this.subscription = observable.subscribe({
      next: () => {
        this.showToast(
          itemType === 'goodPoint' ? 'エピソードを削除しました' : 'アクションを削除しました',
          'success'
        );
        this.loadData();
      },
      error: (err: { error?: { message?: string } }) => {
        this.showToast(
          err.error?.message ||
            (itemType === 'goodPoint' ? 'エピソードの削除に失敗しました' : 'アクションの削除に失敗しました'),
          'error'
        );
      },
    });
  }

  /**
   * フォームグループのすべてのフィールドをtouchedにする
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
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
   * トースト通知を閉じる
   */
  onToastDismiss(): void {
    this.toastMessage.set(null);
  }

  /**
   * Escapeキーでモーダルを閉じる
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isModalOpen()) {
      this.onCloseModal();
    }
  }

  /**
   * オーバーレイクリックでモーダルを閉じる
   */
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('followup-page__overlay')) {
      this.onCloseModal();
    }
  }

  /**
   * オーバーレイキーボード操作でモーダルを閉じる
   */
  onOverlayKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if ((event.target as HTMLElement).classList.contains('followup-page__overlay')) {
        this.onCloseModal();
      }
    }
  }

  /**
   * エピソード/アクション一覧が空かどうか
   */
  get isEmpty(): boolean {
    return this.itemType() === 'goodPoint' 
      ? this.episodes().length === 0 
      : this.actions().length === 0;
  }
}

