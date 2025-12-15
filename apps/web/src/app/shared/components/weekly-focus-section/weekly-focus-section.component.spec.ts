import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';
import { of, throwError, never, Subject } from 'rxjs';
import { WeeklyFocusSectionComponent } from './weekly-focus-section.component';
import { WeeklyFocusService } from '../../services/weekly-focus.service';
import { WeeklyFocusResponse } from '../../models/weekly-focus.model';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

describe('WeeklyFocusSectionComponent', () => {
  let component: WeeklyFocusSectionComponent;
  let fixture: ComponentFixture<WeeklyFocusSectionComponent>;
  let weeklyFocusService: jasmine.SpyObj<WeeklyFocusService>;
  let router: Router;
  let routerEventsSubject: Subject<NavigationEnd>;

  beforeEach(async () => {
    const weeklyFocusServiceSpy = jasmine.createSpyObj('WeeklyFocusService', [
      'getCurrentWeekFocuses',
      'deleteWeeklyFocus',
    ]);

    routerEventsSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [WeeklyFocusSectionComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: WeeklyFocusService, useValue: weeklyFocusServiceSpy },
        provideLucideIconsForTesting(),
      ],
    }).compileComponents();

    weeklyFocusService = TestBed.inject(
      WeeklyFocusService
    ) as jasmine.SpyObj<WeeklyFocusService>;
    router = TestBed.inject(Router);
    // Router.eventsをモック
    spyOnProperty(router, 'events', 'get').and.returnValue(routerEventsSubject.asObservable());
    fixture = TestBed.createComponent(WeeklyFocusSectionComponent);
    component = fixture.componentInstance;
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('初期化時にフォーカスを読み込むこと', () => {
    const mockFocuses: WeeklyFocusResponse[] = [
      {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: '2025-12-09T12:00:00Z',
        item: {
          id: 'gp-1',
          content: 'テストよかったこと',
          status: '進行中',
          success_count: 0,
        },
        reportId: 'report-1',
      },
    ];

    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of(mockFocuses));

    fixture.detectChanges();

    expect(weeklyFocusService.getCurrentWeekFocuses).toHaveBeenCalled();
    expect(component.focuses).toEqual(mockFocuses);
    expect(component.loading).toBe(false);
  });

  it('読み込み中はローディング表示されること', () => {
    // ローディング中（完了しないObservable）をシミュレート
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(never());
    
    fixture.detectChanges();

    // loadFocuses()が呼ばれてloadingがtrueになることを確認
    expect(component.loading).toBe(true);

    const element = fixture.nativeElement as HTMLElement;
    const loading = element.querySelector('.weekly-focus-section__loading');
    expect(loading).toBeTruthy();
    expect(loading?.textContent).toContain('読み込み中');
  });

  it('エラー時はエラーメッセージが表示されること', () => {
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(
      throwError(() => new Error('エラー'))
    );

    fixture.detectChanges();

    expect(component.error).toBe('フォーカスの読み込みに失敗しました');
    expect(component.loading).toBe(false);
  });

  it('フォーカスが空の場合、空状態が表示されること', () => {
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    expect(component.isEmpty).toBe(true);
    const element = fixture.nativeElement as HTMLElement;
    const empty = element.querySelector('.weekly-focus-section__empty');
    expect(empty).toBeTruthy();
  });

  it('追加ボタンクリック時、addClickedイベントが発火されること', () => {
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    spyOn(component.addClicked, 'emit');
    component.onAddClick();
    expect(component.addClicked.emit).toHaveBeenCalled();
  });

  it('削除ボタンクリック時、フォーカスが削除されること', () => {
    const mockFocuses: WeeklyFocusResponse[] = [
      {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: '2025-12-09T12:00:00Z',
        item: null,
        reportId: null,
      },
    ];

    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of(mockFocuses));
    weeklyFocusService.deleteWeeklyFocus.and.returnValue(of(undefined));

    fixture.detectChanges();

    component.onDelete('focus-1');

    expect(weeklyFocusService.deleteWeeklyFocus).toHaveBeenCalledWith('focus-1');
    expect(weeklyFocusService.getCurrentWeekFocuses).toHaveBeenCalledTimes(2);
  });

  it('削除エラー時、エラーメッセージが設定されること', () => {
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    weeklyFocusService.deleteWeeklyFocus.and.returnValue(
      throwError(() => new Error('エラー'))
    );

    fixture.detectChanges();

    component.onDelete('focus-1');

    expect(component.error).toBe('フォーカスの削除に失敗しました');
  });

  it('showAddButtonがfalseの場合、追加ボタンが表示されないこと', () => {
    component.showAddButton = false;
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const addButton = element.querySelector('app-button');
    expect(addButton).toBeNull();
  });

  it('コンポーネント破棄時、subscriptionが解除されること', () => {
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    const subscription = component['subscription'];
    expect(subscription).toBeDefined();

    spyOn(subscription!, 'unsubscribe');
    component.ngOnDestroy();
    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });

  it('コンポーネント破棄時、subscriptionがundefinedでもエラーにならないこと', () => {
    weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
    fixture.detectChanges();

    component['subscription'] = undefined;
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  describe('ルーターイベント', () => {
    it('ホーム画面に遷移した時、フォーカスを再読み込みすること', () => {
      weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
      fixture.detectChanges();

      // 初期読み込みをリセット
      weeklyFocusService.getCurrentWeekFocuses.calls.reset();

      const mockFocuses: WeeklyFocusResponse[] = [
        {
          id: 'focus-1',
          userId: 'user-1',
          itemType: 'goodPoint',
          itemId: 'gp-1',
          goalId: null,
          weekStartDate: '2025-12-09',
          createdAt: '2025-12-09T12:00:00Z',
          item: {
            id: 'gp-1',
            content: 'テストよかったこと',
            status: '進行中',
            success_count: 0,
          },
          reportId: 'report-1',
        },
      ];
      weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of(mockFocuses));

      // NavigationEndイベントを発火（/homeに遷移）
      const navigationEnd = new NavigationEnd(1, '/home', '/home');
      routerEventsSubject.next(navigationEnd);

      expect(weeklyFocusService.getCurrentWeekFocuses).toHaveBeenCalled();
      expect(component.focuses).toEqual(mockFocuses);
    });

    it('ルートパス(/)に遷移した時、フォーカスを再読み込みすること', () => {
      weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
      fixture.detectChanges();

      // 初期読み込みをリセット
      weeklyFocusService.getCurrentWeekFocuses.calls.reset();

      const mockFocuses: WeeklyFocusResponse[] = [];
      weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of(mockFocuses));

      // NavigationEndイベントを発火（/に遷移）
      const navigationEnd = new NavigationEnd(1, '/', '/');
      routerEventsSubject.next(navigationEnd);

      expect(weeklyFocusService.getCurrentWeekFocuses).toHaveBeenCalled();
    });

    it('ホーム画面以外に遷移した時、フォーカスを再読み込みしないこと', () => {
      weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
      fixture.detectChanges();

      // 初期読み込みをリセット
      weeklyFocusService.getCurrentWeekFocuses.calls.reset();

      // NavigationEndイベントを発火（/daily-reportsに遷移）
      const navigationEnd = new NavigationEnd(1, '/daily-reports', '/daily-reports');
      routerEventsSubject.next(navigationEnd);

      expect(weeklyFocusService.getCurrentWeekFocuses).not.toHaveBeenCalled();
    });

    it('コンポーネント破棄時、routerSubscriptionが解除されること', () => {
      weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
      fixture.detectChanges();

      const routerSubscription = component['routerSubscription'];
      expect(routerSubscription).toBeDefined();

      spyOn(routerSubscription!, 'unsubscribe');
      component.ngOnDestroy();
      expect(routerSubscription!.unsubscribe).toHaveBeenCalled();
    });

    it('コンポーネント破棄時、routerSubscriptionがundefinedでもエラーにならないこと', () => {
      weeklyFocusService.getCurrentWeekFocuses.and.returnValue(of([]));
      fixture.detectChanges();

      component['routerSubscription'] = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});

