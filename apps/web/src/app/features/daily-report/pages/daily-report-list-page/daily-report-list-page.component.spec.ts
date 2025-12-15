import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { DailyReportListPageComponent } from './daily-report-list-page.component';
import { DailyReportService } from '../../services/daily-report.service';
import { AuthService } from '../../../auth/services/auth.service';
import { signal } from '@angular/core';
import { provideLucideIconsForTesting } from '../../../../shared/test-helpers/lucide-icons.helper';

describe('DailyReportListPageComponent', () => {
  let component: DailyReportListPageComponent;
  let fixture: ComponentFixture<DailyReportListPageComponent>;
  let mockDailyReportService: jasmine.SpyObj<DailyReportService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockReportData = {
    data: [
      {
        id: '1',
        date: '2025-12-05',
        events: '今日のできごと1',
        goodPointIds: ['gp1'],
        improvementIds: [],
        goodPointSummary: {
          count: 1,
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
      },
      {
        id: '2',
        date: '2025-12-04',
        events: '今日のできごと2',
        goodPointIds: [],
        improvementIds: ['imp1'],
        goodPointSummary: {
          count: 0,
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
      },
    ],
    total: 2,
  };

  beforeEach(async () => {
    mockDailyReportService = jasmine.createSpyObj('DailyReportService', [
      'getAll',
      'getAllWithPaging',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: signal({ id: 'user1', email: 'test@example.com' }),
    });

    mockDailyReportService.getAll.and.returnValue(of(mockReportData));

    await TestBed.configureTestingModule({
      imports: [DailyReportListPageComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: DailyReportService, useValue: mockDailyReportService },
        { provide: AuthService, useValue: mockAuthService },
        provideLucideIconsForTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyReportListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('初期ロード', () => {
    it('ngOnInit時に日報一覧を取得する', () => {
      expect(mockDailyReportService.getAll).toHaveBeenCalled();
    });

    it('ロード完了後にisLoadingがfalseになる', fakeAsync(() => {
      tick();
      expect(component.isLoading()).toBe(false);
    }));

    it('日報データがセットされる', fakeAsync(() => {
      tick();
      expect(component.reports().length).toBe(2);
      expect(component.total()).toBe(2);
    }));
  });

  describe('エラーハンドリング', () => {
    it('API呼び出し失敗時にエラーメッセージが設定される', fakeAsync(() => {
      mockDailyReportService.getAll.and.returnValue(
        throwError(() => ({ error: { message: 'エラーが発生しました' } }))
      );

      component.loadReports();
      tick();

      expect(component.errorMessage()).toBe('エラーが発生しました');
      expect(component.isLoading()).toBe(false);
    }));

    it('retry()でリロードできる', fakeAsync(() => {
      mockDailyReportService.getAll.and.returnValue(of(mockReportData));

      component.retry();
      tick();

      expect(mockDailyReportService.getAll).toHaveBeenCalled();
    }));
  });

  describe('ページング', () => {
    it('hasMoreが正しく計算される', fakeAsync(() => {
      tick();
      // offset=2, total=2 なので hasMore は false
      expect(component.hasMore).toBe(false);
    }));

    it('loadMore()で追加データを取得できる', fakeAsync(() => {
      const moreData = {
        data: [
          {
            id: '3',
            date: '2025-12-03',
            events: '追加のできごと',
            goodPointIds: [],
            improvementIds: [],
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
          },
        ],
        total: 3,
      };

      // 初期状態を設定
      component['total'].set(5);
      component['offset'] = 2;

      mockDailyReportService.getAllWithPaging.and.returnValue(of(moreData));

      component.loadMore();
      tick();

      expect(mockDailyReportService.getAllWithPaging).toHaveBeenCalledWith(30, 2);
    }));

    it('loadMore()でisLoadingMore中は追加ロードしない', fakeAsync(() => {
      component['total'].set(5);
      component['offset'] = 2;
      component.isLoadingMore.set(true);

      component.loadMore();
      tick();

      expect(mockDailyReportService.getAllWithPaging).not.toHaveBeenCalled();
    }));

    it('loadMore()でoffset >= totalの場合は追加ロードしない', fakeAsync(() => {
      component['total'].set(2);
      component['offset'] = 2;

      component.loadMore();
      tick();

      expect(mockDailyReportService.getAllWithPaging).not.toHaveBeenCalled();
    }));

    it('loadMore()でエラーが発生した場合はisLoadingMoreがfalseになる', fakeAsync(() => {
      component['total'].set(5);
      component['offset'] = 2;

      mockDailyReportService.getAllWithPaging.and.returnValue(
        throwError(() => new Error('エラー'))
      );

      component.loadMore();
      tick();

      expect(component.isLoadingMore()).toBe(false);
    }));
  });

  describe('UI表示', () => {
    it('ローディング中はスピナーが表示される', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner).toBeTruthy();
    });

    it('日報がある場合はリストが表示される', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const cards = fixture.nativeElement.querySelectorAll('app-report-card');
      expect(cards.length).toBe(2);
    }));

    it('日報がない場合は空状態が表示される', fakeAsync(() => {
      mockDailyReportService.getAll.and.returnValue(of({ data: [], total: 0 }));
      component.loadReports();
      tick();
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('app-empty-state');
      expect(emptyState).toBeTruthy();
    }));
  });

  describe('ナビゲーション', () => {
    it('onReportClick()が呼ばれるとルーター遷移する', () => {
      const navigateSpy = spyOn(component['router'], 'navigate');
      component.onReportClick('report-123');
      expect(navigateSpy).toHaveBeenCalledWith(['/daily-reports', 'report-123']);
    });

    it('logout()でログアウトしてログインページに遷移する', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(of(void 0));
      const navigateSpy = spyOn(component['router'], 'navigate');

      component.logout();
      tick();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    }));

    it('logout()でエラーが発生してもログインページに遷移する', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(throwError(() => new Error('エラー')));
      const navigateSpy = spyOn(component['router'], 'navigate');

      component.logout();
      tick();

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    }));
  });

  describe('エラーメッセージなし', () => {
    it('エラーメッセージがない場合はデフォルトメッセージが設定される', fakeAsync(() => {
      mockDailyReportService.getAll.and.returnValue(
        throwError(() => ({ error: {} }))
      );

      component.loadReports();
      tick();

      expect(component.errorMessage()).toBe('日報の読み込みに失敗しました');
    }));
  });
});

