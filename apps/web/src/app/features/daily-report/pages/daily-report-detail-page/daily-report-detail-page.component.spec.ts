import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { importProvidersFrom } from '@angular/core';
import {
  LucideAngularModule,
  FileText,
  Clipboard,
  ChartBar,
  Target,
  Sparkles,
  Lightbulb,
  Calendar,
  TriangleAlert,
  Eye,
  EyeOff,
  Heart,
  Pin,
} from 'lucide-angular';
import { DailyReportDetailPageComponent } from './daily-report-detail-page.component';
import { DailyReportService } from '../../services/daily-report.service';
import { AuthService } from '../../../auth/services/auth.service';
import { signal } from '@angular/core';
import { DailyReport, GoodPointStatus, ImprovementStatus } from '../../models/daily-report.model';

describe('DailyReportDetailPageComponent', () => {
  let component: DailyReportDetailPageComponent;
  let fixture: ComponentFixture<DailyReportDetailPageComponent>;
  let mockDailyReportService: jasmine.SpyObj<DailyReportService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockReport: DailyReport = {
    id: 'report-1',
    userId: 'user-1',
    date: '2025-12-05',
    events: '今日のできごと',
    learnings: '今日の学び',
    goodPoints: [
      {
        id: 'gp1',
        userId: 'user-1',
        content: 'よかったこと',
        factors: '要因',
        tags: [],
        status: '未対応' as GoodPointStatus,
        createdAt: '2025-12-05T10:00:00Z',
        updatedAt: '2025-12-05T10:00:00Z',
      },
    ],
    improvements: [
      {
        id: 'imp1',
        userId: 'user-1',
        content: '改善点',
        action: 'アクション',
        status: '未着手' as ImprovementStatus,
        createdAt: '2025-12-05T10:00:00Z',
        updatedAt: '2025-12-05T10:00:00Z',
      },
    ],
    createdAt: '2025-12-05T10:00:00Z',
    updatedAt: '2025-12-05T10:00:00Z',
  };

  beforeEach(async () => {
    mockDailyReportService = jasmine.createSpyObj('DailyReportService', ['getById']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: signal({ id: 'user1', email: 'test@example.com' }),
    });

    mockDailyReportService.getById.and.returnValue(of(mockReport));

    await TestBed.configureTestingModule({
      imports: [DailyReportDetailPageComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: DailyReportService, useValue: mockDailyReportService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'report-1' : null),
              },
            },
          },
        },
        importProvidersFrom(
          LucideAngularModule.pick({
            FileText,
            Clipboard,
            ChartBar,
            Target,
            Sparkles,
            Lightbulb,
            Calendar,
            TriangleAlert,
            Eye,
            EyeOff,
            Heart,
            Pin,
          })
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyReportDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('初期ロード', () => {
    it('ngOnInit時に日報詳細を取得する', () => {
      expect(mockDailyReportService.getById).toHaveBeenCalledWith('report-1');
    });

    it('ロード完了後にisLoadingがfalseになる', fakeAsync(() => {
      tick();
      expect(component.isLoading()).toBe(false);
    }));

    it('日報データがセットされる', fakeAsync(() => {
      tick();
      expect(component.report()?.id).toBe('report-1');
      expect(component.report()?.events).toBe('今日のできごと');
    }));
  });

  describe('エラーハンドリング', () => {
    it('404エラー時に適切なメッセージが表示される', fakeAsync(() => {
      mockDailyReportService.getById.and.returnValue(
        throwError(() => ({ status: 404 }))
      );

      component.loadReport('non-existent');
      tick();

      expect(component.errorMessage()).toBe('日報が見つかりません');
    }));

    it('403エラー時に適切なメッセージが表示される', fakeAsync(() => {
      mockDailyReportService.getById.and.returnValue(
        throwError(() => ({ status: 403 }))
      );

      component.loadReport('forbidden');
      tick();

      expect(component.errorMessage()).toBe('この日報へのアクセス権限がありません');
    }));

    it('その他のエラー時にデフォルトメッセージが表示される', fakeAsync(() => {
      mockDailyReportService.getById.and.returnValue(
        throwError(() => ({ status: 500 }))
      );

      component.loadReport('error');
      tick();

      expect(component.errorMessage()).toBe('日報の読み込みに失敗しました');
    }));
  });

  describe('formatDate', () => {
    it('日付を正しくフォーマットする', () => {
      // 2025-12-05 は金曜日
      expect(component.formatDate('2025-12-05')).toBe('2025/12/5（金）');
    });
  });

  describe('ナビゲーション', () => {
    it('goBack()で一覧ページに遷移する', () => {
      const navigateSpy = spyOn(component['router'], 'navigate');
      component.goBack();
      expect(navigateSpy).toHaveBeenCalledWith(['/daily-reports']);
    });

    it('logout()でログアウトしてログインページに遷移する', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(of(void 0));
      const navigateSpy = spyOn(component['router'], 'navigate');

      component.logout();
      tick();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    }));

    it('retry()でリロードできる', fakeAsync(() => {
      mockDailyReportService.getById.and.returnValue(of(mockReport));

      component.retry();
      tick();

      expect(mockDailyReportService.getById).toHaveBeenCalledWith('report-1');
    }));
  });

  describe('UI表示', () => {
    it('ローディング中はスピナーが表示される', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner).toBeTruthy();
    });

    it('日報詳細が表示される', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const reportDetail = fixture.nativeElement.querySelector('.report-detail');
      expect(reportDetail).toBeTruthy();
    }));

    it('できごとセクションが表示される', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const content = fixture.nativeElement.querySelector('.content-text');
      expect(content.textContent).toContain('今日のできごと');
    }));

    it('よかったことセクションが表示される', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const goodPointSection = fixture.nativeElement.querySelector('.item-card');
      expect(goodPointSection).toBeTruthy();
    }));

    it('StatusBadgeComponentが使用されている', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const statusBadge = fixture.nativeElement.querySelector('app-status-badge');
      expect(statusBadge).toBeTruthy();
    }));

    it('getGoodPointStatusBadgeTypeが正しくマッピングされる', () => {
      expect(component.getGoodPointStatusBadgeType('未対応' as GoodPointStatus)).toBe('未着手');
      expect(component.getGoodPointStatusBadgeType('未達' as GoodPointStatus)).toBe('未達成');
      expect(component.getGoodPointStatusBadgeType('再現成功' as GoodPointStatus)).toBe('再現成功');
      // defaultケースをテスト（新しいステータス型が追加された場合）
      expect(component.getGoodPointStatusBadgeType('未着手' as GoodPointStatus)).toBe('未着手');
    });

    it('getImprovementStatusBadgeTypeが正しくマッピングされる', () => {
      expect(component.getImprovementStatusBadgeType('未着手')).toBe('未着手');
      expect(component.getImprovementStatusBadgeType('進行中')).toBe('進行中');
      expect(component.getImprovementStatusBadgeType('完了')).toBe('完了');
      // すべてのImprovementStatusをテスト
      const allStatuses: ImprovementStatus[] = ['未着手', '進行中', '完了'];
      allStatuses.forEach((status) => {
        expect(component.getImprovementStatusBadgeType(status)).toBe(status);
      });
    });
  });

  describe('logout()エラーケース', () => {
    it('logout()でエラーが発生してもログインページに遷移する', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(throwError(() => new Error('エラー')));
      const navigateSpy = spyOn(component['router'], 'navigate');

      component.logout();
      tick();

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    }));
  });

  describe('エラーメッセージ付きAPIエラー', () => {
    it('エラーにmessageがある場合はそれを表示する', fakeAsync(() => {
      mockDailyReportService.getById.and.returnValue(
        throwError(() => ({ status: 500, error: { message: 'カスタムエラー' } }))
      );

      component.loadReport('error');
      tick();

      expect(component.errorMessage()).toBe('カスタムエラー');
    }));
  });
});

describe('DailyReportDetailPageComponent (IDなし)', () => {
  let component: DailyReportDetailPageComponent;
  let fixture: ComponentFixture<DailyReportDetailPageComponent>;
  let mockDailyReportService: jasmine.SpyObj<DailyReportService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockDailyReportService = jasmine.createSpyObj('DailyReportService', ['getById']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: signal({ id: 'user1', email: 'test@example.com' }),
    });

    await TestBed.configureTestingModule({
      imports: [DailyReportDetailPageComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: DailyReportService, useValue: mockDailyReportService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null, // IDがnull
              },
            },
          },
        },
        importProvidersFrom(
          LucideAngularModule.pick({
            FileText,
            Clipboard,
            ChartBar,
            Target,
            Sparkles,
            Lightbulb,
            Calendar,
            TriangleAlert,
            Eye,
            EyeOff,
            Heart,
            Pin,
          })
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyReportDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('IDがない場合はエラーメッセージが設定される', () => {
    expect(component.errorMessage()).toBe('日報IDが指定されていません');
    expect(component.isLoading()).toBe(false);
    expect(mockDailyReportService.getById).not.toHaveBeenCalled();
  });
});

