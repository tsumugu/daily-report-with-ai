import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowupCardComponent } from './followup-card.component';
import { FollowupItem } from '../../../../shared/models/followup.model';

describe('FollowupCardComponent', () => {
  let component: FollowupCardComponent;
  let fixture: ComponentFixture<FollowupCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowupCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowupCardComponent);
    component = fixture.componentInstance;
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('itemが設定されていない場合、何も表示されないこと', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('.followup-card');
    expect(card).toBeNull();
  });

  it('itemが設定されている場合、カードが表示されること', () => {
    component.item = {
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
    };
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('.followup-card');
    expect(card).toBeTruthy();
  });

  it('itemTypeがgoodPointの場合、「よかったこと」と表示されること', () => {
    component.item = {
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
    fixture.detectChanges();
    expect(component.itemTypeLabel).toBe('よかったこと');
    expect(component.itemTypeIcon).toBe('✨');
  });

  it('itemTypeがimprovementの場合、「改善点」と表示されること', () => {
    component.item = {
      itemType: 'improvement',
      item: {
        id: 'imp-1',
        content: 'テスト',
        status: '未着手',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    fixture.detectChanges();
    expect(component.itemTypeLabel).toBe('改善点');
    expect(component.itemTypeIcon).toBe('📝');
  });

  it('success_count >= 3の場合、定着バッジが表示されること', () => {
    component.item = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '定着',
        success_count: 3,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    fixture.detectChanges();
    expect(component.isSettled).toBe(true);
    const element = fixture.nativeElement as HTMLElement;
    const badge = element.querySelector('.followup-card__settled-badge');
    expect(badge).toBeTruthy();
  });

  it('カードクリック時、cardClickイベントが発火されること', () => {
    component.item = {
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
    fixture.detectChanges();

    spyOn(component.cardClick, 'emit');
    component.onCardClick();
    expect(component.cardClick.emit).toHaveBeenCalledWith('report-1');
  });

  it('フォローアップボタンクリック時、followupClickイベントが発火されること', () => {
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
    component.item = item;
    fixture.detectChanges();

    spyOn(component.followupClick, 'emit');
    component.onFollowupClick();
    expect(component.followupClick.emit).toHaveBeenCalledWith(item);
  });

  it('success_countがundefinedの場合、successCountは0を返すこと', () => {
    component.item = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: undefined as any,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    fixture.detectChanges();
    expect(component.successCount).toBe(0);
  });

  it('success_countがnullの場合、successCountは0を返すこと', () => {
    component.item = {
      itemType: 'goodPoint',
      item: {
        id: 'gp-1',
        content: 'テスト',
        status: '進行中',
        success_count: null as any,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    };
    fixture.detectChanges();
    expect(component.successCount).toBe(0);
  });
});

