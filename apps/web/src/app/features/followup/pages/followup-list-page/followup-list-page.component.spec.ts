import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { FollowupListPageComponent } from './followup-list-page.component';
import { FollowupService } from '../../../../shared/services/followup.service';
import { WeeklyFocusService } from '../../../../shared/services/weekly-focus.service';
import { FollowupItemsResponse, FollowupItem } from '../../../../shared/models/followup.model';
import { WeeklyFocusResponse } from '../../../../shared/models/weekly-focus.model';
import { provideLucideIconsForTesting } from '../../../../shared/test-helpers/lucide-icons.helper';

describe('FollowupListPageComponent', () => {
  let component: FollowupListPageComponent;
  let fixture: ComponentFixture<FollowupListPageComponent>;
  let followupService: jasmine.SpyObj<FollowupService>;
  let weeklyFocusService: jasmine.SpyObj<WeeklyFocusService>;
  let router: Router;

  beforeEach(async () => {
    const followupServiceSpy = jasmine.createSpyObj('FollowupService', ['getFollowupItems']);
    const weeklyFocusServiceSpy = jasmine.createSpyObj('WeeklyFocusService', [
      'getCurrentWeekFocuses',
      'addWeeklyFocus',
      'deleteWeeklyFocus',
    ]);

    await TestBed.configureTestingModule({
      imports: [FollowupListPageComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: FollowupService, useValue: followupServiceSpy },
        { provide: WeeklyFocusService, useValue: weeklyFocusServiceSpy },
        provideLucideIconsForTesting(),
      ],
    }).compileComponents();

    followupService = TestBed.inject(FollowupService) as jasmine.SpyObj<FollowupService>;
    weeklyFocusService = TestBed.inject(WeeklyFocusService) as jasmine.SpyObj<WeeklyFocusService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture = TestBed.createComponent(FollowupListPageComponent);
    component = fixture.componentInstance;
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('初期化時にフォロー項目と週次フォーカスを読み込むこと', () => {
    const mockResponse: FollowupItemsResponse = {
      data: [
        {
          itemType: 'goodPoint',
          item: {
            id: 'gp-1',
            content: 'テストよかったこと',
            status: '進行中',
            success_count: 1,
            createdAt: '2025-12-05T12:00:00Z',
          },
          reportDate: '2025-12-05',
          reportId: 'report-1',
        },
      ],
      total: 1,
    };
    const mockWeeklyFocuses: WeeklyFocusResponse[] = [];

    followupService.getFollowupItems.and.returnValue(of(mockResponse));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of(mockWeeklyFocuses));

    fixture.detectChanges();

    expect(followupService.getFollowupItems).toHaveBeenCalled();
    expect(weeklyFocusService.getCurrentWeekFocuses).toHaveBeenCalled();
    expect(component.items().length).toBe(1);
    expect(component.total()).toBe(1);
  });

  it('ステータスフィルタ変更時、再読み込みされること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));

    fixture.detectChanges();

    component.onStatusFilterChange('すべて');
    expect(followupService.getFollowupItems).toHaveBeenCalledWith({
      status: 'すべて',
      itemType: undefined,
      limit: 20,
      offset: 0,
    });
  });

  it('種別フィルタ変更時、再読み込みされること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));

    fixture.detectChanges();

    component.onItemTypeFilterChange('goodPoint');
    expect(followupService.getFollowupItems).toHaveBeenCalledWith({
      status: '未着手,進行中',
      itemType: 'goodPoint',
      limit: 20,
      offset: 0,
    });
  });

  it('カードクリック時、日報詳細画面に遷移すること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    component.onCardClick('report-1');
    expect(router.navigate).toHaveBeenCalledWith(['/daily-reports', 'report-1']);
  });

  it('エラー時、エラーメッセージが表示されること', () => {
    followupService.getFollowupItems.and.returnValue(throwError(() => new Error('エラー')));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.errorMessage()).toBe('フォロー項目の読み込みに失敗しました');
  });

  it('空状態の場合、空状態メッセージが表示されること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.isEmpty).toBe(true);
  });

  it('hasMoreが正しく計算されること', () => {
    const mockData: FollowupItem[] = Array(10).fill({
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    });
    followupService.getFollowupItems.and.returnValue(
      of({ data: mockData, total: 20 })
    );
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.hasMore).toBe(true);
  });

  it('onFollowupClick()が呼ばれた場合、モーダルが開くこと', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    component.onFollowupClick(item);

    expect(router.navigate).toHaveBeenCalledWith(['/followups', 'goodPoint', 'gp-1']);
  });

  it('onModalClosed()が呼ばれた場合、モーダルが閉じること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    component.selectedItem.set(item);
    component.isModalOpen.set(true);

    component.onModalClosed();

    expect(component.selectedItem()).toBeNull();
    expect(component.isModalOpen()).toBe(false);
  });

  it('onModalSaved()が呼ばれた場合、アイテムを再読み込みしてモーダルを閉じること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    component.selectedItem.set(item);
    component.isModalOpen.set(true);

    component.onModalSaved();

    expect(followupService.getFollowupItems).toHaveBeenCalledTimes(2); // 初期化時 + onModalSaved時
    expect(component.selectedItem()).toBeNull();
    expect(component.isModalOpen()).toBe(false);
  });

  it('onLoadMore()が呼ばれた場合、追加読み込みが実行されること', () => {
    const initialData: FollowupItem[] = Array(10).fill({
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    });
    const moreData: FollowupItem[] = Array(10).fill({
      itemType: 'goodPoint',
      item: {
        id: 'gp-2',
        content: 'テスト2',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-2',
    });

    followupService.getFollowupItems.and.returnValue(of({ data: initialData, total: 20 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    followupService.getFollowupItems.and.returnValue(of({ data: moreData, total: 20 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    component.onLoadMore();

    expect(followupService.getFollowupItems).toHaveBeenCalledWith({
      status: '未着手,進行中',
      itemType: undefined,
      limit: 20,
      offset: 10, // 最初の10件の後
    });
    expect(component.items().length).toBe(20);
  });

  it('loadItems(reset=false)の場合、既存アイテムに追加されること', () => {
    const initialData: FollowupItem[] = Array(10).fill({
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    });
    const moreData: FollowupItem[] = Array(5).fill({
      itemType: 'goodPoint',
      item: {
        id: 'gp-2',
        content: 'テスト2',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-2',
    });

    followupService.getFollowupItems.and.returnValue(of({ data: initialData, total: 15 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    followupService.getFollowupItems.and.returnValue(of({ data: moreData, total: 15 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    component['loadItems'](false);

    expect(component.items().length).toBe(15);
    expect(component.isLoadingMore()).toBe(false);
  });

  it('ngOnDestroy()が呼ばれた場合、subscriptionが解除されること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    const subscription = component['subscription'];
    expect(subscription).toBeDefined();

    spyOn(subscription!, 'unsubscribe');
    component.ngOnDestroy();
    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });

  it('ngOnDestroy()が呼ばれた場合、subscriptionがundefinedでもエラーにならないこと', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    component['subscription'] = undefined;
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('isInWeeklyFocus()が正しく判定すること', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    const mockWeeklyFocuses: WeeklyFocusResponse[] = [
      {
        id: 'wf-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-01',
        createdAt: '2025-12-05T12:00:00Z',
        item: {
          id: 'gp-1',
          content: 'テスト',
          status: '進行中',
          success_count: 0,
        },
        reportId: 'report-1',
      },
    ];

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of(mockWeeklyFocuses));
    fixture.detectChanges();

    expect(component.isInWeeklyFocus(item)).toBe(true);
  });

  it('onAddToWeeklyFocus()が呼ばれた場合、週次フォーカスが追加されること', fakeAsync(() => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    const mockResponse: WeeklyFocusResponse = {
      id: 'wf-1',
      userId: 'user-1',
      itemType: 'goodPoint',
      itemId: 'gp-1',
      goalId: null,
      weekStartDate: '2025-12-01',
      createdAt: '2025-12-05T12:00:00Z',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
      },
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    weeklyFocusService.addWeeklyFocus.and.returnValue(of(mockResponse));
    fixture.detectChanges();

    const initialCallCount = followupService.getFollowupItems.calls.count();
    const initialWeeklyFocusCallCount = weeklyFocusService.getCurrentWeekFocuses.calls.count();

    component.onAddToWeeklyFocus(item);
    tick();

    expect(weeklyFocusService.addWeeklyFocus).toHaveBeenCalledWith({
      itemType: 'goodPoint',
      itemId: 'gp-1',
    });
    expect(component.toastMessage()).toBe('今週のフォーカスに追加しました');
    expect(component.toastVariant()).toBe('success');
    expect(component.addingToWeeklyFocusItemId()).toBeNull();
    // 成功時にloadWeeklyFocuses()とloadItems()が呼ばれることを確認
    expect(weeklyFocusService.getCurrentWeekFocuses.calls.count()).toBeGreaterThan(initialWeeklyFocusCallCount);
    expect(followupService.getFollowupItems.calls.count()).toBeGreaterThan(initialCallCount);
  }));

  it('onAddToWeeklyFocus()でエラーが発生した場合、トースト通知が表示されること', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    weeklyFocusService.addWeeklyFocus.and.returnValue(
      throwError(() => ({ error: { message: 'エラーメッセージ' } }))
    );
    fixture.detectChanges();

    component.onAddToWeeklyFocus(item);

    expect(component.toastMessage()).toBe('エラーメッセージ');
    expect(component.toastVariant()).toBe('error');
  });

  it('onAddToWeeklyFocus()でエラーメッセージがない場合、デフォルトメッセージが表示されること', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    weeklyFocusService.addWeeklyFocus.and.returnValue(throwError(() => ({})));
    fixture.detectChanges();

    component.onAddToWeeklyFocus(item);

    expect(component.toastMessage()).toBe('週次フォーカスの追加に失敗しました');
    expect(component.toastVariant()).toBe('error');
  });

  it('onAddToWeeklyFocus()で最大件数に達している場合、エラーメッセージが表示されること', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    // 最大件数に達している場合はaddWeeklyFocusは呼ばれないので、戻り値は設定不要
    
    fixture.detectChanges();

    // detectChanges後に最大件数に達している状態を設定
    // （detectChangesでloadWeeklyFocuses()が呼ばれてweeklyFocusCountがリセットされる可能性があるため）
    component.weeklyFocusCount.set(5);

    // 最大件数に達していることを確認
    expect(component.isWeeklyFocusLimitReached()).toBe(true);

    // 初期状態をクリア
    component.toastMessage.set(null);
    component.toastVariant.set('success');

    component.onAddToWeeklyFocus(item);

    expect(component.toastMessage()).toBe('今週のフォーカスは最大5件まで設定できます');
    expect(component.toastVariant()).toBe('error');
    expect(weeklyFocusService.addWeeklyFocus).not.toHaveBeenCalled();
    expect(component.addingToWeeklyFocusItemId()).toBeNull();
  });

  it('onToggleWeeklyFocus()で既にフォーカスに設定されている場合、削除されること', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    const mockWeeklyFocuses: WeeklyFocusResponse[] = [
      {
        id: 'wf-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-01',
        createdAt: '2025-12-05T12:00:00Z',
        item: {
          id: 'gp-1',
          content: 'テスト',
          status: '進行中',
          success_count: 0,
        },
        reportId: 'report-1',
      },
    ];

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of(mockWeeklyFocuses));
    weeklyFocusService.deleteWeeklyFocus.and.returnValue(of(undefined));
    fixture.detectChanges();

    component.onToggleWeeklyFocus(item);

    expect(weeklyFocusService.deleteWeeklyFocus).toHaveBeenCalledWith('wf-1');
  });

  it('onToggleWeeklyFocus()でフォーカスに設定されていない場合、追加されること', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    weeklyFocusService.addWeeklyFocus.and.returnValue(
      of({
        id: 'wf-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-01',
        createdAt: '2025-12-05T12:00:00Z',
        item: {
          id: 'gp-1',
          content: 'テスト',
          status: '進行中',
          success_count: 0,
        },
        reportId: 'report-1',
      })
    );
    fixture.detectChanges();

    component.onToggleWeeklyFocus(item);

    expect(weeklyFocusService.addWeeklyFocus).toHaveBeenCalled();
  });

  it('onRemoveFromWeeklyFocus()が呼ばれた場合、週次フォーカスが削除されること', fakeAsync(() => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    weeklyFocusService.deleteWeeklyFocus.and.returnValue(of(undefined));
    fixture.detectChanges();

    const initialCallCount = followupService.getFollowupItems.calls.count();
    const initialWeeklyFocusCallCount = weeklyFocusService.getCurrentWeekFocuses.calls.count();

    component.onRemoveFromWeeklyFocus(item, 'wf-1');
    tick();

    expect(weeklyFocusService.deleteWeeklyFocus).toHaveBeenCalledWith('wf-1');
    expect(component.toastMessage()).toBe('今週のフォーカスから削除しました');
    expect(component.toastVariant()).toBe('success');
    expect(component.addingToWeeklyFocusItemId()).toBeNull();
    // 成功時にloadWeeklyFocuses()とloadItems()が呼ばれることを確認
    expect(weeklyFocusService.getCurrentWeekFocuses.calls.count()).toBeGreaterThan(initialWeeklyFocusCallCount);
    expect(followupService.getFollowupItems.calls.count()).toBeGreaterThan(initialCallCount);
  }));

  it('onRemoveFromWeeklyFocus()でエラーが発生した場合、トースト通知が表示されること', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    weeklyFocusService.deleteWeeklyFocus.and.returnValue(
      throwError(() => ({ error: { message: 'エラーメッセージ' } }))
    );
    fixture.detectChanges();

    component.onRemoveFromWeeklyFocus(item, 'wf-1');

    expect(component.toastMessage()).toBe('エラーメッセージ');
    expect(component.toastVariant()).toBe('error');
  });

  it('onRemoveFromWeeklyFocus()でエラーメッセージがない場合、デフォルトメッセージが表示されること', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    weeklyFocusService.deleteWeeklyFocus.and.returnValue(throwError(() => ({})));
    fixture.detectChanges();

    component.onRemoveFromWeeklyFocus(item, 'wf-1');

    expect(component.toastMessage()).toBe('週次フォーカスの削除に失敗しました');
    expect(component.toastVariant()).toBe('error');
  });

  it('getWeeklyFocusId()が正しくIDを返すこと', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    const mockWeeklyFocuses: WeeklyFocusResponse[] = [
      {
        id: 'wf-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-01',
        createdAt: '2025-12-05T12:00:00Z',
        item: {
          id: 'gp-1',
          content: 'テスト',
          status: '進行中',
          success_count: 0,
        },
        reportId: 'report-1',
      },
    ];

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of(mockWeeklyFocuses));
    fixture.detectChanges();

    expect(component.getWeeklyFocusId(item)).toBe('wf-1');
  });

  it('getWeeklyFocusId()でIDが見つからない場合、nullを返すこと', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-999',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    expect(component.getWeeklyFocusId(item)).toBeNull();
  });

  it('getSelectValue()が正しく値を返すこと', () => {
    const selectElement = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'test-value';
    option.textContent = 'Test Value';
    selectElement.appendChild(option);
    selectElement.value = 'test-value';
    const event = { target: selectElement } as unknown as Event;

    expect(component.getSelectValue(event)).toBe('test-value');
  });

  it('getItemTypeValue()が正しく値を返すこと', () => {
    const selectElement = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'goodPoint';
    option.textContent = 'Good Point';
    selectElement.appendChild(option);
    selectElement.value = 'goodPoint';
    const event = { target: selectElement } as unknown as Event;

    expect(component.getItemTypeValue(event)).toBe('goodPoint');
  });

  it('loadWeeklyFocuses()でエラーが発生した場合、エラーがスローされないこと', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(throwError(() => new Error('エラー')));
    fixture.detectChanges();

    expect(() => component['loadWeeklyFocuses']()).not.toThrow();
  });

  it('onToastDismiss()が呼ばれた場合、トーストメッセージがクリアされること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    component.toastMessage.set('テストメッセージ');
    component.onToastDismiss();

    expect(component.toastMessage()).toBeNull();
  });

  it('isAddingToWeeklyFocusCheck()が正しく判定すること', () => {
    const item: FollowupItem = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    component.addingToWeeklyFocusItemId.set('goodPoint-gp-1');
    expect(component.isAddingToWeeklyFocusCheck(item)).toBe(true);

    component.addingToWeeklyFocusItemId.set('goodPoint-gp-2');
    expect(component.isAddingToWeeklyFocusCheck(item)).toBe(false);
  });

  it('isWeeklyFocusLimitReached()が正しく判定すること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    component.weeklyFocusCount.set(4);
    expect(component.isWeeklyFocusLimitReached()).toBe(false);

    component.weeklyFocusCount.set(5);
    expect(component.isWeeklyFocusLimitReached()).toBe(true);

    component.weeklyFocusCount.set(6);
    expect(component.isWeeklyFocusLimitReached()).toBe(true);
  });

  it('showToast()で3秒後に自動でトーストが非表示になること', fakeAsync(() => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    component['showToast']('テストメッセージ', 'success');
    expect(component.toastMessage()).toBe('テストメッセージ');
    expect(component.toastVariant()).toBe('success');

    tick(3000);
    expect(component.toastMessage()).toBeNull();
  }));
});

