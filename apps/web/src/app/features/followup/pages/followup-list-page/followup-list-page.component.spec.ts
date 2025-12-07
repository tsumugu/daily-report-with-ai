import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FollowupListPageComponent } from './followup-list-page.component';
import { FollowupService } from '../../../../shared/services/followup.service';
import { WeeklyFocusService } from '../../../../shared/services/weekly-focus.service';
import { FollowupItemsResponse, FollowupItem } from '../../../../shared/models/followup.model';
import { WeeklyFocusResponse } from '../../../../shared/models/weekly-focus.model';

describe('FollowupListPageComponent', () => {
  let component: FollowupListPageComponent;
  let fixture: ComponentFixture<FollowupListPageComponent>;
  let followupService: jasmine.SpyObj<FollowupService>;
  let weeklyFocusService: jasmine.SpyObj<WeeklyFocusService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const followupServiceSpy = jasmine.createSpyObj('FollowupService', ['getFollowupItems']);
    const weeklyFocusServiceSpy = jasmine.createSpyObj('WeeklyFocusService', [
      'getCurrentWeekFocuses',
      'addWeeklyFocus',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: {} },
    });

    await TestBed.configureTestingModule({
      imports: [FollowupListPageComponent],
      providers: [
        { provide: FollowupService, useValue: followupServiceSpy },
        { provide: WeeklyFocusService, useValue: weeklyFocusServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    followupService = TestBed.inject(FollowupService) as jasmine.SpyObj<FollowupService>;
    weeklyFocusService = TestBed.inject(WeeklyFocusService) as jasmine.SpyObj<WeeklyFocusService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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
    fixture.detectChanges();

    component.onCardClick('report-1');
    expect(router.navigate).toHaveBeenCalledWith(['/daily-reports', 'report-1']);
  });

  it('エラー時、エラーメッセージが表示されること', () => {
    followupService.getFollowupItems.and.returnValue(throwError(() => new Error('エラー')));

    fixture.detectChanges();

    expect(component.errorMessage()).toBe('フォロー項目の読み込みに失敗しました');
  });

  it('空状態の場合、空状態メッセージが表示されること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));

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

    fixture.detectChanges();

    expect(component.hasMore).toBe(true);
  });

  it('onFollowupClick()が呼ばれた場合、モーダルが開くこと', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
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

    expect(component.selectedItem()).toEqual(item);
    expect(component.isModalOpen()).toBe(true);
  });

  it('onModalClosed()が呼ばれた場合、モーダルが閉じること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
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
    fixture.detectChanges();

    followupService.getFollowupItems.and.returnValue(of({ data: moreData, total: 20 }));
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
    fixture.detectChanges();

    followupService.getFollowupItems.and.returnValue(of({ data: moreData, total: 15 }));
    component['loadItems'](false);

    expect(component.items().length).toBe(15);
    expect(component.isLoadingMore()).toBe(false);
  });

  it('ngOnDestroy()が呼ばれた場合、subscriptionが解除されること', () => {
    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
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
        weekStartDate: '2025-12-01',
        createdAt: '2025-12-05T12:00:00Z',
        item: {
          id: 'gp-1',
          content: 'テスト',
          status: '進行中',
          success_count: 0,
        },
      },
    ];

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of(mockWeeklyFocuses));
    fixture.detectChanges();

    expect(component.isInWeeklyFocus(item)).toBe(true);
  });

  it('onAddToWeeklyFocus()が呼ばれた場合、週次フォーカスが追加されること', () => {
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
      weekStartDate: '2025-12-01',
      createdAt: '2025-12-05T12:00:00Z',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: 0,
      },
    };

    followupService.getFollowupItems.and.returnValue(of({ data: [], total: 0 }));
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    weeklyFocusService.addWeeklyFocus.and.returnValue(of(mockResponse));
    fixture.detectChanges();

    component.onAddToWeeklyFocus(item);

    expect(weeklyFocusService.addWeeklyFocus).toHaveBeenCalledWith({
      itemType: 'goodPoint',
      itemId: 'gp-1',
    });
  });

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
});

