import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FollowupPageComponent } from './followup-page.component';
import { FollowupService } from '../../../../shared/services/followup.service';
import { EpisodesResponse, ActionsResponse } from '../../../../shared/models/followup.model';
import { provideLucideIconsForTesting } from '../../../../shared/test-helpers/lucide-icons.helper';

describe('FollowupPageComponent', () => {
  let component: FollowupPageComponent;
  let fixture: ComponentFixture<FollowupPageComponent>;
  let followupService: jasmine.SpyObj<FollowupService>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  const mockEpisodesResponse: EpisodesResponse = {
    data: [
      {
        id: 'episode-1',
        date: '2025-12-10',
        memo: 'テストメモ1',
        createdAt: '2025-12-10T12:00:00Z',
      },
      {
        id: 'episode-2',
        date: '2025-12-09',
        memo: 'テストメモ2',
        createdAt: '2025-12-09T12:00:00Z',
      },
    ],
    count: 2,
    status: '進行中',
  };

  const mockActionsResponse: ActionsResponse = {
    data: [
      {
        id: 'action-1',
        date: '2025-12-10',
        memo: 'テストメモ1',
        createdAt: '2025-12-10T12:00:00Z',
      },
    ],
    count: 1,
    status: '進行中',
  };

  beforeEach(async () => {
    const followupServiceSpy = jasmine.createSpyObj('FollowupService', [
      'getEpisodes',
      'getActions',
      'addEpisode',
      'addAction',
      'deleteEpisode',
      'deleteAction',
    ]);

    const paramMapSpy = jasmine.createSpy('get').and.callFake((key: string) => {
      if (key === 'itemType') return 'goodPoint';
      if (key === 'itemId') return 'gp-1';
      return null;
    });

    await TestBed.configureTestingModule({
      imports: [
        FollowupPageComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
      ],
      providers: [
        { provide: FollowupService, useValue: followupServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: paramMapSpy,
              },
            },
          },
        },
        provideLucideIconsForTesting(),
      ],
    }).compileComponents();

    followupService = TestBed.inject(FollowupService) as jasmine.SpyObj<FollowupService>;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(FollowupPageComponent);
    component = fixture.componentInstance;
  });

  describe('初期状態', () => {
    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('フォームコントロールが存在しない場合、dateTouchedとmemoTouchedがfalseを返すこと', () => {
      // フォームコントロールを削除してnullを返すようにする
      component.form.removeControl('date');
      component.form.removeControl('memo');
      
      expect(component.dateTouched).toBe(false);
      expect(component.memoTouched).toBe(false);
    });

    it('ルートパラメータからitemTypeとitemIdを取得すること', () => {
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));
      fixture.detectChanges(); // ngOnInitを実行
      expect(component.itemType()).toBe('goodPoint');
      expect(component.itemId()).toBe('gp-1');
    });

    it('ページタイトルが正しく設定されること', () => {
      expect(component.pageTitle).toBe('よかったことのフォローアップ');
    });

    it('改善点の場合、ページタイトルが正しく設定されること', () => {
      component.itemType.set('improvement');
      expect(component.pageTitle).toBe('改善点のフォローアップ');
    });
  });

  describe('データ読み込み', () => {
    it('よかったことの場合、エピソード一覧を取得すること', () => {
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));

      fixture.detectChanges();

      expect(followupService.getEpisodes).toHaveBeenCalledWith('gp-1');
      expect(component.episodes().length).toBe(2);
      expect(component.count()).toBe(2);
      expect(component.status()).toBe('進行中');
    });

    it('改善点の場合、アクション一覧を取得すること', () => {
      // ルートパラメータをモック
      (activatedRoute.snapshot.paramMap.get as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'itemType') return 'improvement';
        if (key === 'itemId') return 'imp-1';
        return null;
      });

      component.itemType.set('improvement');
      component.itemId.set('imp-1');
      followupService.getActions.and.returnValue(of(mockActionsResponse));

      component.loadData(); // loadDataを直接呼ぶ
      fixture.detectChanges();

      expect(followupService.getActions).toHaveBeenCalledWith('imp-1');
      expect(component.actions().length).toBe(1);
      expect(component.count()).toBe(1);
      expect(component.status()).toBe('進行中');
    });

    it('エラーが発生した場合、エラーメッセージを表示すること', () => {
      followupService.getEpisodes.and.returnValue(throwError(() => ({ error: { message: 'エラー' } })));

      fixture.detectChanges();

      expect(component.errorMessage()).toBe('エピソードの読み込みに失敗しました');
    });

    it('itemIdが空の場合、エラーメッセージを表示すること', () => {
      component.itemId.set('');
      component.loadData();

      expect(component.errorMessage()).toBe('項目IDが指定されていません');
    });

    it('改善点の場合、アクション読み込みエラーが発生した場合、エラーメッセージを表示すること', () => {
      // ルートパラメータをモック
      (activatedRoute.snapshot.paramMap.get as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'itemType') return 'improvement';
        if (key === 'itemId') return 'imp-1';
        return null;
      });
      component.itemType.set('improvement');
      component.itemId.set('imp-1');
      followupService.getActions.and.returnValue(throwError(() => ({ error: { message: 'エラー' } })));

      component.loadData();
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('アクションの読み込みに失敗しました');
    });
  });

  describe('エピソード/アクション追加', () => {
    beforeEach(() => {
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));
      fixture.detectChanges();
    });

    it('モーダルを開くこと', () => {
      component.onAddClick();

      expect(component.isModalOpen()).toBe(true);
    });

    it('フォームが送信された場合、エピソードを追加すること', () => {
      const mockFollowup = {
        id: 'episode-3',
        userId: 'user-1',
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: '新しいメモ',
        date: '2025-12-11',
        createdAt: '2025-12-11T12:00:00Z',
        updatedAt: '2025-12-11T12:00:00Z',
      };

      followupService.addEpisode.and.returnValue(of(mockFollowup));
      followupService.getEpisodes.and.returnValue(
        of({
          ...mockEpisodesResponse,
          data: [...mockEpisodesResponse.data, mockFollowup],
          count: 3,
        })
      );

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '新しいメモ',
      });

      component.onSubmit();

      expect(followupService.addEpisode).toHaveBeenCalledWith('gp-1', {
        date: '2025-12-11',
        memo: '新しいメモ',
      });
      expect(component.isModalOpen()).toBe(false);
    });

    it('よかったことの場合、メモなしでエピソードを追加できること', () => {
      const mockFollowup = {
        id: 'episode-3',
        userId: 'user-1',
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: null,
        date: '2025-12-11',
        createdAt: '2025-12-11T12:00:00Z',
        updatedAt: '2025-12-11T12:00:00Z',
      };

      followupService.addEpisode.and.returnValue(of(mockFollowup));
      followupService.getEpisodes.and.returnValue(
        of({
          ...mockEpisodesResponse,
          data: [...mockEpisodesResponse.data, mockFollowup],
          count: 3,
        })
      );

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '', // 空文字列
      });

      component.onSubmit();

      expect(followupService.addEpisode).toHaveBeenCalledWith('gp-1', {
        date: '2025-12-11',
        memo: undefined, // 空文字列はundefinedに変換される
      });
      expect(component.isModalOpen()).toBe(false);
    });

    it('フォームが無効な場合、送信しないこと', () => {
      component.onAddClick();
      component.form.patchValue({
        date: '', // 必須フィールドが空
      });

      component.onSubmit();

      expect(followupService.addEpisode).not.toHaveBeenCalled();
    });

    it('エピソード追加エラーが発生した場合、エラーメッセージを表示すること', () => {
      followupService.addEpisode.and.returnValue(
        throwError(() => ({ error: { message: '追加エラー' } }))
      );

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '新しいメモ',
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('追加エラー');
      expect(component.isSubmitting()).toBe(false);
    });

    it('エピソード追加エラーが発生した場合（メッセージなし）、デフォルトエラーメッセージを表示すること', () => {
      followupService.addEpisode.and.returnValue(throwError(() => ({})));

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '新しいメモ',
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('エピソードの追加に失敗しました');
      expect(component.isSubmitting()).toBe(false);
    });

    it('改善点の場合、アクションを追加できること', () => {
      component.itemType.set('improvement');
      component.itemId.set('imp-1');
      followupService.getActions.and.returnValue(of(mockActionsResponse));
      fixture.detectChanges();

      const mockFollowup = {
        id: 'action-2',
        userId: 'user-1',
        itemType: 'improvement' as const,
        itemId: 'imp-1',
        status: '完了' as const,
        memo: '新しいアクション',
        date: '2025-12-11',
        createdAt: '2025-12-11T12:00:00Z',
        updatedAt: '2025-12-11T12:00:00Z',
      };

      followupService.addAction.and.returnValue(of(mockFollowup));
      followupService.getActions.and.returnValue(
        of({
          ...mockActionsResponse,
          data: [...mockActionsResponse.data, mockFollowup],
          count: 2,
        })
      );

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '新しいアクション',
      });

      component.onSubmit();

      expect(followupService.addAction).toHaveBeenCalledWith('imp-1', {
        date: '2025-12-11',
        memo: '新しいアクション',
      });
      expect(component.isModalOpen()).toBe(false);
    });

    it('改善点の場合、アクション追加エラーが発生した場合、エラーメッセージを表示すること', () => {
      component.itemType.set('improvement');
      component.itemId.set('imp-1');
      followupService.getActions.and.returnValue(of(mockActionsResponse));
      fixture.detectChanges();

      followupService.addAction.and.returnValue(throwError(() => ({})));

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '新しいアクション',
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('アクションの追加に失敗しました');
      expect(component.isSubmitting()).toBe(false);
    });

    it('改善点の場合、メモなしでアクションを追加できること', () => {
      component.itemType.set('improvement');
      component.itemId.set('imp-1');
      followupService.getActions.and.returnValue(of(mockActionsResponse));
      fixture.detectChanges();

      const mockFollowup = {
        id: 'action-2',
        userId: 'user-1',
        itemType: 'improvement' as const,
        itemId: 'imp-1',
        status: '完了' as const,
        memo: null,
        date: '2025-12-11',
        createdAt: '2025-12-11T12:00:00Z',
        updatedAt: '2025-12-11T12:00:00Z',
      };

      followupService.addAction.and.returnValue(of(mockFollowup));
      followupService.getActions.and.returnValue(
        of({
          ...mockActionsResponse,
          data: [...mockActionsResponse.data, mockFollowup],
          count: 2,
        })
      );

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '', // 空文字列
      });

      component.onSubmit();

      expect(followupService.addAction).toHaveBeenCalledWith('imp-1', {
        date: '2025-12-11',
        memo: undefined, // 空文字列はundefinedに変換される
      });
      expect(component.isModalOpen()).toBe(false);
    });

    it('エピソード追加成功後、loadDataでエラーが発生した場合、エラーメッセージが設定されること', fakeAsync(() => {
      const mockFollowup = {
        id: 'episode-3',
        userId: 'user-1',
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: '新しいメモ',
        date: '2025-12-11',
        createdAt: '2025-12-11T12:00:00Z',
        updatedAt: '2025-12-11T12:00:00Z',
      };

      followupService.addEpisode.and.returnValue(of(mockFollowup));
      followupService.getEpisodes.and.returnValue(throwError(() => ({ error: { message: 'loadData error' } })));

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '新しいメモ',
      });

      component.onSubmit();

      // setTimeoutの実行を待つ
      tick(1);

      expect(component.errorMessage()).toBe('エピソードの読み込みに失敗しました');
      expect(component.isModalOpen()).toBe(false); // モーダルは閉じたまま
    }));

    it('loadData()内で同期的なエラーが発生した場合、console.errorが呼ばれること', fakeAsync(() => {
      const mockFollowup = {
        id: 'episode-3',
        userId: 'user-1',
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: '新しいメモ',
        date: '2025-12-11',
        createdAt: '2025-12-11T12:00:00Z',
        updatedAt: '2025-12-11T12:00:00Z',
      };

      followupService.addEpisode.and.returnValue(of(mockFollowup));
      // loadData()内でエラーをスローするようにモック
      spyOn(component, 'loadData').and.throwError(new Error('synchronous error'));
      spyOn(console, 'error');

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '新しいメモ',
      });

      component.onSubmit();

      // setTimeoutの実行を待つ
      tick(1);

      expect(console.error).toHaveBeenCalledWith('データの読み込みに失敗しました:', jasmine.any(Error));
      expect(component.isModalOpen()).toBe(false); // モーダルは閉じたまま
    }));

    it('既存のsubscriptionがある場合、新しいsubscriptionを設定する前にunsubscribeすること', () => {
      const mockFollowup1 = {
        id: 'episode-1',
        userId: 'user-1',
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: 'メモ1',
        date: '2025-12-11',
        createdAt: '2025-12-11T12:00:00Z',
        updatedAt: '2025-12-11T12:00:00Z',
      };

      const mockFollowup2 = {
        id: 'episode-2',
        userId: 'user-1',
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: 'メモ2',
        date: '2025-12-12',
        createdAt: '2025-12-12T12:00:00Z',
        updatedAt: '2025-12-12T12:00:00Z',
      };

      followupService.addEpisode.and.returnValue(of(mockFollowup1));
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));

      // 1回目の追加
      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: 'メモ1',
      });
      component.onSubmit();

      // 2回目の追加（既存のsubscriptionがある状態）
      followupService.addEpisode.and.returnValue(of(mockFollowup2));
      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-12',
        memo: 'メモ2',
      });

      const previousSubscription = component['subscription'];
      spyOn(previousSubscription!, 'unsubscribe');

      component.onSubmit();

      expect(previousSubscription!.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('エピソード/アクション削除', () => {
    beforeEach(() => {
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));
      fixture.detectChanges();
    });

    it('エピソードを削除できること', () => {
      followupService.deleteEpisode.and.returnValue(of(undefined));
      followupService.getEpisodes.and.returnValue(
        of({
          ...mockEpisodesResponse,
          data: [mockEpisodesResponse.data[1]],
          count: 1,
        })
      );

      component.onDelete('episode-1');

      expect(followupService.deleteEpisode).toHaveBeenCalledWith('gp-1', 'episode-1');
      expect(component.toastMessage()).toBe('エピソードを削除しました');
      expect(component.toastVariant()).toBe('success');
    });

    it('改善点の場合、アクションを削除できること', () => {
      component.itemType.set('improvement');
      component.itemId.set('imp-1');
      followupService.getActions.and.returnValue(of(mockActionsResponse));
      fixture.detectChanges();

      followupService.deleteAction.and.returnValue(of(undefined));
      followupService.getActions.and.returnValue(
        of({
          ...mockActionsResponse,
          data: [],
          count: 0,
        })
      );

      component.onDelete('action-1');

      expect(followupService.deleteAction).toHaveBeenCalledWith('imp-1', 'action-1');
      expect(component.toastMessage()).toBe('アクションを削除しました');
      expect(component.toastVariant()).toBe('success');
    });

    it('削除エラーが発生した場合、エラーメッセージを表示すること', () => {
      followupService.deleteEpisode.and.returnValue(
        throwError(() => ({ error: { message: '削除エラー' } }))
      );

      component.onDelete('episode-1');

      expect(component.toastMessage()).toBe('削除エラー');
      expect(component.toastVariant()).toBe('error');
    });

    it('削除エラーが発生した場合（メッセージなし）、デフォルトエラーメッセージを表示すること', () => {
      followupService.deleteEpisode.and.returnValue(throwError(() => ({})));

      component.onDelete('episode-1');

      expect(component.toastMessage()).toBe('エピソードの削除に失敗しました');
      expect(component.toastVariant()).toBe('error');
    });

    it('改善点の場合、アクション削除エラーが発生した場合（メッセージなし）、デフォルトエラーメッセージを表示すること', () => {
      component.itemType.set('improvement');
      component.itemId.set('imp-1');
      followupService.getActions.and.returnValue(of(mockActionsResponse));
      fixture.detectChanges();

      followupService.deleteAction.and.returnValue(throwError(() => ({})));

      component.onDelete('action-1');

      expect(component.toastMessage()).toBe('アクションの削除に失敗しました');
      expect(component.toastVariant()).toBe('error');
    });
  });

  describe('モーダル操作', () => {
    beforeEach(() => {
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));
      fixture.detectChanges();
    });

    it('モーダルを閉じること', () => {
      component.onAddClick();
      expect(component.isModalOpen()).toBe(true);

      component.onCloseModal();

      expect(component.isModalOpen()).toBe(false);
      expect(component.form.value.date).toBeNull();
    });

    it('Escapeキーでモーダルを閉じること', () => {
      component.onAddClick();
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onKeyDown(event);

      expect(component.isModalOpen()).toBe(false);
    });

    it('オーバーレイクリックでモーダルを閉じること', () => {
      component.onAddClick();
      const overlay = document.createElement('div');
      overlay.className = 'followup-page__overlay';
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: overlay });

      component.onOverlayClick(event);

      expect(component.isModalOpen()).toBe(false);
    });
  });

  describe('ステータス表示', () => {
    beforeEach(() => {
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));
      fixture.detectChanges();
    });

    it('ステータステキストが正しく表示されること', () => {
      expect(component.statusText).toBe('エピソード: 2回 進行中');
    });

    it('ステータスバッジタイプが正しく設定されること', () => {
      expect(component.statusBadgeType).toBe('進行中');
    });

    it('modalTitleが正しく設定されること', () => {
      expect(component.modalTitle).toBe('エピソードを追加');
    });

    it('memoLabelが正しく設定されること', () => {
      expect(component.memoLabel).toBe('再現メモ');
    });

    it('memoPlaceholderが正しく設定されること', () => {
      expect(component.memoPlaceholder).toBe('どのように再現したか記録してください');
    });

    it('dateTouchedがfalseの場合、falseを返すこと', () => {
      expect(component.dateTouched).toBe(false);
    });

    it('memoTouchedがfalseの場合、falseを返すこと', () => {
      expect(component.memoTouched).toBe(false);
    });
  });

  describe('改善点の場合のゲッター', () => {
    beforeEach(() => {
      // ルートパラメータをモック
      (activatedRoute.snapshot.paramMap.get as jasmine.Spy).and.callFake((key: string) => {
        if (key === 'itemType') return 'improvement';
        if (key === 'itemId') return 'imp-1';
        return null;
      });
      component.itemType.set('improvement');
      component.itemId.set('imp-1');
      followupService.getActions.and.returnValue(of(mockActionsResponse));
      fixture.detectChanges();
    });

    it('modalTitleが正しく設定されること', () => {
      expect(component.modalTitle).toBe('アクションを追加');
    });

    it('dateLabelが正しく設定されること', () => {
      expect(component.dateLabel).toBe('アクションをした日');
    });

    it('memoLabelが正しく設定されること', () => {
      expect(component.memoLabel).toBe('進捗メモ');
    });

    it('memoPlaceholderが正しく設定されること', () => {
      expect(component.memoPlaceholder).toBe('どのようなアクションを実施したか記録してください');
    });
  });

  describe('フォームエラーメッセージ', () => {
    beforeEach(() => {
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));
      fixture.detectChanges();
    });

    it('日付フィールドが必須エラーの場合、エラーメッセージを表示すること', () => {
      component.onAddClick();
      const dateControl = component.form.get('date');
      dateControl?.markAsTouched();
      dateControl?.setValue('');

      expect(component.dateErrorMessage).toBe('再現日は必須です');
      expect(component.dateTouched).toBe(true);
    });

    it('メモフィールドが最大長エラーの場合、エラーメッセージを表示すること', () => {
      component.onAddClick();
      const memoControl = component.form.get('memo');
      memoControl?.markAsTouched();
      memoControl?.setValue('a'.repeat(501));

      expect(component.memoErrorMessage).toBe('メモは500文字以内で入力してください');
      expect(component.memoTouched).toBe(true);
    });

    it('改善点の場合、日付フィールドのエラーメッセージが正しく表示されること', () => {
      component.itemType.set('improvement');
      component.onAddClick();
      const dateControl = component.form.get('date');
      dateControl?.markAsTouched();
      dateControl?.setValue('');

      expect(component.dateErrorMessage).toBe('アクションをした日は必須です');
    });

    it('日付フィールドにエラーがない場合、空文字を返すこと', () => {
      component.onAddClick();
      const dateControl = component.form.get('date');
      dateControl?.setValue('2025-12-11');
      dateControl?.markAsTouched();

      expect(component.dateErrorMessage).toBe('');
    });

    it('メモフィールドにエラーがない場合、空文字を返すこと', () => {
      component.onAddClick();
      const memoControl = component.form.get('memo');
      memoControl?.setValue('テストメモ');
      memoControl?.markAsTouched();

      expect(component.memoErrorMessage).toBe('');
    });
  });

  describe('トースト通知', () => {
    beforeEach(() => {
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));
      fixture.detectChanges();
    });

    it('エピソード追加成功時にトースト通知が表示され、3秒後に自動的に閉じられること', () => {
      jasmine.clock().install();
      const mockFollowup = {
        id: 'episode-3',
        userId: 'user-1',
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: '新しいメモ',
        date: '2025-12-11',
        createdAt: '2025-12-11T12:00:00Z',
        updatedAt: '2025-12-11T12:00:00Z',
      };

      followupService.addEpisode.and.returnValue(of(mockFollowup));
      followupService.getEpisodes.and.returnValue(
        of({
          ...mockEpisodesResponse,
          data: [...mockEpisodesResponse.data, mockFollowup],
          count: 3,
        })
      );

      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '新しいメモ',
      });

      component.onSubmit();

      expect(component.toastMessage()).toBe('エピソードを追加しました');
      expect(component.toastVariant()).toBe('success');

      jasmine.clock().tick(3000);

      expect(component.toastMessage()).toBeNull();
      jasmine.clock().uninstall();
    });

    it('トースト通知を手動で閉じられること', () => {
      component.onAddClick();
      component.form.patchValue({
        date: '2025-12-11',
        memo: '新しいメモ',
      });

      const mockFollowup = {
        id: 'episode-3',
        userId: 'user-1',
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: '新しいメモ',
        date: '2025-12-11',
        createdAt: '2025-12-11T12:00:00Z',
        updatedAt: '2025-12-11T12:00:00Z',
      };

      followupService.addEpisode.and.returnValue(of(mockFollowup));
      followupService.getEpisodes.and.returnValue(
        of({
          ...mockEpisodesResponse,
          data: [...mockEpisodesResponse.data, mockFollowup],
          count: 3,
        })
      );

      component.onSubmit();

      expect(component.toastMessage()).toBe('エピソードを追加しました');

      component.onToastDismiss();

      expect(component.toastMessage()).toBeNull();
    });
  });

  describe('キーボード操作', () => {
    beforeEach(() => {
      followupService.getEpisodes.and.returnValue(of(mockEpisodesResponse));
      fixture.detectChanges();
    });

    it('Enterキーでオーバーレイをクリックした場合、モーダルを閉じること', () => {
      component.onAddClick();
      const overlay = document.createElement('div');
      overlay.className = 'followup-page__overlay';
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      Object.defineProperty(event, 'target', { value: overlay });

      component.onOverlayKeyDown(event);

      expect(component.isModalOpen()).toBe(false);
    });

    it('Spaceキーでオーバーレイをクリックした場合、モーダルを閉じること', () => {
      component.onAddClick();
      const overlay = document.createElement('div');
      overlay.className = 'followup-page__overlay';
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      Object.defineProperty(event, 'target', { value: overlay });

      component.onOverlayKeyDown(event);

      expect(component.isModalOpen()).toBe(false);
    });

    it('オーバーレイ以外の要素でEnterキーを押した場合、モーダルを閉じないこと', () => {
      component.onAddClick();
      const otherElement = document.createElement('div');
      otherElement.className = 'other-element';
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      Object.defineProperty(event, 'target', { value: otherElement });

      component.onOverlayKeyDown(event);

      expect(component.isModalOpen()).toBe(true);
    });

    it('Enter/Space以外のキーを押した場合、モーダルを閉じないこと', () => {
      component.onAddClick();
      const overlay = document.createElement('div');
      overlay.className = 'followup-page__overlay';
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      Object.defineProperty(event, 'target', { value: overlay });

      component.onOverlayKeyDown(event);

      expect(component.isModalOpen()).toBe(true);
    });
  });
});

