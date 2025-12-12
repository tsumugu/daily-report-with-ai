import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportCardComponent, ReportCardData } from './report-card.component';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

describe('ReportCardComponent', () => {
  let component: ReportCardComponent;
  let fixture: ComponentFixture<ReportCardComponent>;

  const mockReport: ReportCardData = {
    id: 'test-id-1',
    date: '2025-12-05',
    events: '今日はミーティングが3件ありました。午後はコードレビューを行いました。',
    goodPointIds: ['gp1', 'gp2'],
    improvementIds: ['imp1'],
    goodPointSummary: {
      count: 2,
      statusSummary: {
        再現成功: 1,
        定着: 1,
      },
    },
    improvementSummary: {
      count: 1,
      statusSummary: {
        完了: 1,
        習慣化: 0,
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCardComponent],
      providers: [provideLucideIconsForTesting()],
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
      const icon = badge.querySelector('app-icon');
      expect(icon).toBeTruthy();
      expect(icon?.getAttribute('name')).toBe('heart');
    });

    it('改善点バッジが表示される', () => {
      const badge = fixture.nativeElement.querySelector('.report-card__badge--improvement');
      expect(badge).toBeTruthy();
      const icon = badge.querySelector('app-icon');
      expect(icon).toBeTruthy();
      expect(icon?.getAttribute('name')).toBe('file-text');
    });

    it('goodPointsがない場合はバッジが表示されない', () => {
      component.report = {
        ...mockReport,
        goodPointIds: [],
        goodPointSummary: {
          count: 0,
          statusSummary: {
            再現成功: 0,
            定着: 0,
          },
        },
      };
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.report-card__badge--good');
      expect(badge).toBeFalsy();
    });
  });

  describe('サマリー表示', () => {
    it('よかったことサマリーが表示される', () => {
      const summarySection = fixture.nativeElement.querySelector('.report-card__summary');
      expect(summarySection).toBeTruthy();
      const goodPointSummary = summarySection.querySelector('.summary-item');
      expect(goodPointSummary).toBeTruthy();
      expect(goodPointSummary.textContent).toContain('よかったこと');
      expect(goodPointSummary.textContent).toContain('2件');
    });

    it('改善点サマリーが表示される', () => {
      const summarySection = fixture.nativeElement.querySelector('.report-card__summary');
      expect(summarySection).toBeTruthy();
      const improvementSummary = summarySection.querySelectorAll('.summary-item')[1];
      expect(improvementSummary).toBeTruthy();
      expect(improvementSummary.textContent).toContain('改善点');
      expect(improvementSummary.textContent).toContain('1件');
    });

    it('ステータス概要が表示される', () => {
      const summarySection = fixture.nativeElement.querySelector('.report-card__summary');
      expect(summarySection).toBeTruthy();
      const statusSummary = summarySection.querySelector('.summary-item__status');
      expect(statusSummary).toBeTruthy();
      expect(statusSummary.textContent).toContain('再現成功');
      expect(statusSummary.textContent).toContain('定着');
    });

    it('よかったことが0件の場合、サマリーセクションが表示されない', () => {
      component.report = {
        ...mockReport,
        goodPointIds: [],
        goodPointSummary: {
          count: 0,
          statusSummary: {
            再現成功: 0,
            定着: 0,
          },
        },
        improvementIds: [],
        improvementSummary: {
          count: 0,
          statusSummary: {
            完了: 0,
            習慣化: 0,
          },
        },
      };
      fixture.detectChanges();
      const summarySection = fixture.nativeElement.querySelector('.report-card__summary');
      expect(summarySection).toBeFalsy();
    });

    it('ステータス概要が0件の場合、ステータス概要が表示されない', () => {
      component.report = {
        ...mockReport,
        goodPointSummary: {
          count: 2,
          statusSummary: {
            再現成功: 0,
            定着: 0,
          },
        },
        improvementSummary: {
          count: 1,
          statusSummary: {
            完了: 0,
            習慣化: 0,
          },
        },
      };
      fixture.detectChanges();
      const statusSummary = fixture.nativeElement.querySelector('.summary-item__status');
      expect(statusSummary).toBeFalsy();
    });

    it('shouldShowGoodPointSummaryが正しく動作する', () => {
      expect(component.shouldShowGoodPointSummary).toBe(true);
      component.report = {
        ...mockReport,
        goodPointSummary: {
          count: 0,
          statusSummary: {
            再現成功: 0,
            定着: 0,
          },
        },
      };
      fixture.detectChanges();
      expect(component.shouldShowGoodPointSummary).toBe(false);
    });

    it('shouldShowImprovementSummaryが正しく動作する', () => {
      expect(component.shouldShowImprovementSummary).toBe(true);
      component.report = {
        ...mockReport,
        improvementSummary: {
          count: 0,
          statusSummary: {
            完了: 0,
            習慣化: 0,
          },
        },
      };
      fixture.detectChanges();
      expect(component.shouldShowImprovementSummary).toBe(false);
    });

    it('shouldShowGoodPointStatusSummaryが正しく動作する', () => {
      expect(component.shouldShowGoodPointStatusSummary).toBe(true);
      component.report = {
        ...mockReport,
        goodPointSummary: {
          count: 2,
          statusSummary: {
            再現成功: 0,
            定着: 0,
          },
        },
      };
      fixture.detectChanges();
      expect(component.shouldShowGoodPointStatusSummary).toBe(false);
    });

    it('shouldShowImprovementStatusSummaryが正しく動作する', () => {
      expect(component.shouldShowImprovementStatusSummary).toBe(true);
      component.report = {
        ...mockReport,
        improvementSummary: {
          count: 1,
          statusSummary: {
            完了: 0,
            習慣化: 0,
          },
        },
      };
      fixture.detectChanges();
      expect(component.shouldShowImprovementStatusSummary).toBe(false);
    });

    it('shouldShowSummarySectionが正しく動作する', () => {
      expect(component.shouldShowSummarySection).toBe(true);
      component.report = {
        ...mockReport,
        goodPointSummary: {
          count: 0,
          statusSummary: {
            再現成功: 0,
            定着: 0,
          },
        },
        improvementSummary: {
          count: 0,
          statusSummary: {
            完了: 0,
            習慣化: 0,
          },
        },
      };
      fixture.detectChanges();
      expect(component.shouldShowSummarySection).toBe(false);
    });
  });
});

