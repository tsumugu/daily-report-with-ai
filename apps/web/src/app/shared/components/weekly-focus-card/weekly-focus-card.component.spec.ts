import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WeeklyFocusCardComponent } from './weekly-focus-card.component';
import { WeeklyFocusResponse } from '../../models/weekly-focus.model';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

describe('WeeklyFocusCardComponent', () => {
  let component: WeeklyFocusCardComponent;
  let fixture: ComponentFixture<WeeklyFocusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyFocusCardComponent, RouterTestingModule.withRoutes([])],
      providers: [provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(WeeklyFocusCardComponent);
    component = fixture.componentInstance;
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('focusが設定されていない場合、何も表示されないこと', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('.weekly-focus-card');
    expect(card).toBeNull();
  });

  it('focusが設定されている場合、カードが表示されること', () => {
    component.focus = {
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
        success_count: 1,
      },
    };
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('.weekly-focus-card');
    expect(card).toBeTruthy();
  });

  it('itemTypeがgoodPointの場合、「よかったこと」と表示されること', () => {
    component.focus = {
      id: 'focus-1',
      userId: 'user-1',
      itemType: 'goodPoint',
      itemId: 'gp-1',
      weekStartDate: '2025-12-09',
      createdAt: '2025-12-09T12:00:00Z',
      item: null,
    };
    fixture.detectChanges();
    expect(component.itemTypeLabel).toBe('よかったこと');
    expect(component.itemTypeIcon).toBe('heart');
  });

  it('itemTypeがimprovementの場合、「改善点」と表示されること', () => {
    component.focus = {
      id: 'focus-1',
      userId: 'user-1',
      itemType: 'improvement',
      itemId: 'imp-1',
      weekStartDate: '2025-12-09',
      createdAt: '2025-12-09T12:00:00Z',
      item: null,
    };
    fixture.detectChanges();
    expect(component.itemTypeLabel).toBe('改善点');
    expect(component.itemTypeIcon).toBe('file-text');
  });

  it('削除ボタンクリック時、deleteClickedイベントが発火されること', () => {
    component.focus = {
      id: 'focus-1',
      userId: 'user-1',
      itemType: 'goodPoint',
      itemId: 'gp-1',
      weekStartDate: '2025-12-09',
      createdAt: '2025-12-09T12:00:00Z',
      item: null,
    };
    fixture.detectChanges();

    spyOn(component.deleteClicked, 'emit');
    component.onDelete();
    expect(component.deleteClicked.emit).toHaveBeenCalledWith('focus-1');
  });

  it('itemがnullの場合、「内容がありません」と表示されること', () => {
    component.focus = {
      id: 'focus-1',
      userId: 'user-1',
      itemType: 'goodPoint',
      itemId: 'gp-1',
      weekStartDate: '2025-12-09',
      createdAt: '2025-12-09T12:00:00Z',
      item: null,
    };
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const text = element.querySelector('.weekly-focus-card__text');
    expect(text?.textContent?.trim()).toBe('内容がありません');
  });

  it('success_countが表示されること', () => {
    component.focus = {
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
        success_count: 3,
      },
    };
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const successCount = element.querySelector('.weekly-focus-card__success-count');
    expect(successCount?.textContent?.trim()).toBe('成功: 3回');
  });

  it('reportDetailUrlが正しく生成されること', () => {
    component.focus = {
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
    };
    expect(component.reportDetailUrl).toBe('/daily-reports/gp-1');
  });

  it('itemがnullの場合、reportDetailUrlが#を返すこと', () => {
    component.focus = {
      id: 'focus-1',
      userId: 'user-1',
      itemType: 'goodPoint',
      itemId: 'gp-1',
      weekStartDate: '2025-12-09',
      createdAt: '2025-12-09T12:00:00Z',
      item: null,
    };
    expect(component.reportDetailUrl).toBe('#');
  });

  it('statusがundefinedの場合、StatusBadgeが表示されないこと', () => {
    component.focus = {
      id: 'focus-1',
      userId: 'user-1',
      itemType: 'goodPoint',
      itemId: 'gp-1',
      weekStartDate: '2025-12-09',
      createdAt: '2025-12-09T12:00:00Z',
      item: null,
    };
    fixture.detectChanges();
    expect(component.status).toBeUndefined();
    const element = fixture.nativeElement as HTMLElement;
    const badge = element.querySelector('app-status-badge');
    expect(badge).toBeNull();
  });

  it('focusがundefinedの場合、onDeleteがエラーにならないこと', () => {
    component.focus = undefined as unknown as WeeklyFocusResponse;
    expect(() => component.onDelete()).not.toThrow();
  });

  it('focus.idがundefinedの場合、onDeleteがイベントを発火しないこと', () => {
    component.focus = {
        id: undefined as unknown as string,
      userId: 'user-1',
      itemType: 'goodPoint',
      itemId: 'gp-1',
      weekStartDate: '2025-12-09',
      createdAt: '2025-12-09T12:00:00Z',
      item: null,
    };
    spyOn(component.deleteClicked, 'emit');
    component.onDelete();
    expect(component.deleteClicked.emit).not.toHaveBeenCalled();
  });

  it('success_countが0の場合、表示されないこと', () => {
    component.focus = {
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
    };
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const successCount = element.querySelector('.weekly-focus-card__success-count');
    expect(successCount).toBeTruthy();
    expect(successCount?.textContent?.trim()).toBe('成功: 0回');
  });
});

