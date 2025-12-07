import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, never } from 'rxjs';
import { WeeklyFocusSectionComponent } from './weekly-focus-section.component';
import { WeeklyFocusService } from '../../services/weekly-focus.service';
import { WeeklyFocusResponse } from '../../models/weekly-focus.model';

describe('WeeklyFocusSectionComponent', () => {
  let component: WeeklyFocusSectionComponent;
  let fixture: ComponentFixture<WeeklyFocusSectionComponent>;
  let weeklyFocusService: jasmine.SpyObj<WeeklyFocusService>;

  beforeEach(async () => {
    const weeklyFocusServiceSpy = jasmine.createSpyObj('WeeklyFocusService', [
      'getCurrentWeekFocuses',
      'deleteWeeklyFocus',
    ]);

    await TestBed.configureTestingModule({
      imports: [WeeklyFocusSectionComponent],
      providers: [{ provide: WeeklyFocusService, useValue: weeklyFocusServiceSpy }],
    }).compileComponents();

    weeklyFocusService = TestBed.inject(
      WeeklyFocusService
    ) as jasmine.SpyObj<WeeklyFocusService>;
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
        weekStartDate: '2025-12-09',
        createdAt: '2025-12-09T12:00:00Z',
        item: {
          id: 'gp-1',
          content: 'テストよかったこと',
          status: '進行中',
          success_count: 0,
        },
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
        weekStartDate: '2025-12-09',
        createdAt: '2025-12-09T12:00:00Z',
        item: null,
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
});

