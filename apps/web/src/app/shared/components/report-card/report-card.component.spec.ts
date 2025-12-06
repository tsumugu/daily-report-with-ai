import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportCardComponent, ReportCardData } from './report-card.component';

describe('ReportCardComponent', () => {
  let component: ReportCardComponent;
  let fixture: ComponentFixture<ReportCardComponent>;

  const mockReport: ReportCardData = {
    id: 'test-id-1',
    date: '2025-12-05',
    events: '今日はミーティングが3件ありました。午後はコードレビューを行いました。',
    goodPointIds: ['gp1', 'gp2'],
    improvementIds: ['imp1'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportCardComponent);
    component = fixture.componentInstance;
    component.report = mockReport;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('truncatedEvents', () => {
    it('50文字以下のテキストはそのまま表示', () => {
      component.report = {
        ...mockReport,
        events: 'これは短いテキストです',
      };
      fixture.detectChanges();
      expect(component.truncatedEvents).toBe('これは短いテキストです');
    });

    it('50文字を超えるテキストは省略される', () => {
      const longText = 'あ'.repeat(60);
      component.report = {
        ...mockReport,
        events: longText,
      };
      fixture.detectChanges();
      expect(component.truncatedEvents).toBe('あ'.repeat(50) + '...');
    });
  });

  describe('hasGoodPoints', () => {
    it('goodPointIdsが1件以上ある場合はtrue', () => {
      expect(component.hasGoodPoints).toBe(true);
    });

    it('goodPointIdsが空の場合はfalse', () => {
      component.report = {
        ...mockReport,
        goodPointIds: [],
      };
      fixture.detectChanges();
      expect(component.hasGoodPoints).toBe(false);
    });
  });

  describe('hasImprovements', () => {
    it('improvementIdsが1件以上ある場合はtrue', () => {
      expect(component.hasImprovements).toBe(true);
    });

    it('improvementIdsが空の場合はfalse', () => {
      component.report = {
        ...mockReport,
        improvementIds: [],
      };
      fixture.detectChanges();
      expect(component.hasImprovements).toBe(false);
    });
  });

  describe('formattedDate', () => {
    it('日付が正しくフォーマットされる', () => {
      // 2025-12-05 は金曜日
      expect(component.formattedDate).toBe('2025/12/5（金）');
    });
  });

  describe('cardClick', () => {
    it('カードクリック時にcardClickイベントが発火する', () => {
      const spy = spyOn(component.cardClick, 'emit');
      component.onCardClick();
      expect(spy).toHaveBeenCalledWith('test-id-1');
    });

    it('クリックでイベントが発火する', () => {
      const spy = spyOn(component.cardClick, 'emit');
      const card = fixture.nativeElement.querySelector('.report-card');
      card.click();
      expect(spy).toHaveBeenCalledWith('test-id-1');
    });
  });

  describe('UI表示', () => {
    it('日付が表示される', () => {
      const dateElement = fixture.nativeElement.querySelector('.report-card__date');
      expect(dateElement.textContent).toContain('2025/12/5（金）');
    });

    it('イベント内容が表示される', () => {
      const contentElement = fixture.nativeElement.querySelector('.report-card__content');
      expect(contentElement.textContent).toContain('今日はミーティングが3件ありました');
    });

    it('よかったことバッジが表示される', () => {
      const badge = fixture.nativeElement.querySelector('.report-card__badge--good');
      expect(badge).toBeTruthy();
      expect(badge.textContent.trim()).toBe('✨');
    });

    it('改善点バッジが表示される', () => {
      const badge = fixture.nativeElement.querySelector('.report-card__badge--improvement');
      expect(badge).toBeTruthy();
      expect(badge.textContent.trim()).toBe('📝');
    });

    it('goodPointsがない場合はバッジが表示されない', () => {
      component.report = {
        ...mockReport,
        goodPointIds: [],
      };
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.report-card__badge--good');
      expect(badge).toBeFalsy();
    });
  });
});

