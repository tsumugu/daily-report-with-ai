import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Subject } from 'rxjs';
import { DailyReportEditPageComponent } from './daily-report-edit-page.component';
import { DailyReportService } from '../../services/daily-report.service';
import { DailyReport } from '../../models/daily-report.model';
import { provideLucideIconsForTesting } from '../../../../shared/test-helpers/lucide-icons.helper';

describe('DailyReportEditPageComponent', () => {
  let component: DailyReportEditPageComponent;
  let fixture: ComponentFixture<DailyReportEditPageComponent>;
  let dailyReportServiceSpy: jasmine.SpyObj<DailyReportService>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  const mockDailyReport: DailyReport = {
    id: 'report-1',
    userId: 'user-1',
    date: '2025-12-05',
    events: 'テストイベント',
    learnings: 'テスト学び',
    goodPoints: [
      {
        id: 'gp-1',
        userId: 'user-1',
        content: 'よかったこと1',
        factors: '要因1',
        tags: [],
        status: '未対応',
        createdAt: '2025-12-05T00:00:00Z',
        updatedAt: '2025-12-05T00:00:00Z',
      },
    ],
    improvements: [
      {
        id: 'imp-1',
        userId: 'user-1',
        content: '改善点1',
        action: 'アクション1',
        status: '未着手',
        createdAt: '2025-12-05T00:00:00Z',
        updatedAt: '2025-12-05T00:00:00Z',
      },
    ],
    createdAt: '2025-12-05T00:00:00Z',
    updatedAt: '2025-12-05T00:00:00Z',
  };

  beforeEach(async () => {
    dailyReportServiceSpy = jasmine.createSpyObj('DailyReportService', ['getById', 'update']);

    await TestBed.configureTestingModule({
      imports: [
        DailyReportEditPageComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: 'daily-reports/:id', component: DailyReportEditPageComponent },
        ]),
      ],
      providers: [
        { provide: DailyReportService, useValue: dailyReportServiceSpy },
        provideLucideIconsForTesting(),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    spyOn(router, 'navigate');
    spyOn(activatedRoute.snapshot.paramMap, 'get').and.returnValue('report-1');

    fixture = TestBed.createComponent(DailyReportEditPageComponent);
    component = fixture.componentInstance;
  });

  describe('初期化', () => {
    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('フォームが初期化されていること', () => {
      expect(component.form).toBeTruthy();
      expect(component.form.get('date')).toBeTruthy();
      expect(component.form.get('events')).toBeTruthy();
      expect(component.form.get('learnings')).toBeTruthy();
    });

    it('ngOnInitで日報IDが取得できた場合、loadReportが呼ばれること', () => {
      dailyReportServiceSpy.getById.and.returnValue(of(mockDailyReport));
      fixture.detectChanges();

      expect(dailyReportServiceSpy.getById).toHaveBeenCalledWith('report-1');
    });

    it('ngOnInitで日報IDが取得できない場合、エラーメッセージが設定されること', () => {
      // 新しいコンポーネントインスタンスを作成して、paramMap.getをnullを返すようにモック
      (activatedRoute.snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);
      const newFixture = TestBed.createComponent(DailyReportEditPageComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.errorMessage()).toBe('日報IDが指定されていません');
      expect(newComponent.isLoading()).toBeFalse();
    });
  });

  describe('loadReport', () => {
    beforeEach(() => {
      dailyReportServiceSpy.getById.and.returnValue(of(mockDailyReport));
      fixture.detectChanges();
    });

    it('日報データがフォームに設定されること', () => {
      expect(component.form.get('date')?.value).toBe('2025-12-05');
      expect(component.form.get('events')?.value).toBe('テストイベント');
      expect(component.form.get('learnings')?.value).toBe('テスト学び');
    });

    it('よかったことが設定されること', () => {
      expect(component.goodPoints().length).toBe(1);
      expect(component.goodPoints()[0].content).toBe('よかったこと1');
      expect(component.goodPoints()[0].factors).toBe('要因1');
    });

    it('改善点が設定されること', () => {
      expect(component.improvements().length).toBe(1);
      expect(component.improvements()[0].content).toBe('改善点1');
      expect(component.improvements()[0].action).toBe('アクション1');
    });

    it('factorsがnullの場合は空文字列になること', fakeAsync(() => {
      const reportWithoutFactors: DailyReport = {
        ...mockDailyReport,
        goodPoints: [
          {
            ...mockDailyReport.goodPoints[0],
            factors: null,
          },
        ],
      };
      dailyReportServiceSpy.getById.and.returnValue(of(reportWithoutFactors));
      component.loadReport('report-1');
      tick();

      expect(component.goodPoints()[0].factors).toBe('');
    }));

    it('actionがnullの場合は空文字列になること', fakeAsync(() => {
      const reportWithoutAction: DailyReport = {
        ...mockDailyReport,
        improvements: [
          {
            ...mockDailyReport.improvements[0],
            action: null,
          },
        ],
      };
      dailyReportServiceSpy.getById.and.returnValue(of(reportWithoutAction));
      component.loadReport('report-1');
      tick();

      expect(component.improvements()[0].action).toBe('');
    }));

    it('actionがundefinedの場合は空文字列になること', fakeAsync(() => {
      const reportWithoutAction: DailyReport = {
        ...mockDailyReport,
        improvements: [
          {
            ...mockDailyReport.improvements[0],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            action: undefined as any,
          },
        ],
      };
      dailyReportServiceSpy.getById.and.returnValue(of(reportWithoutAction));
      component.loadReport('report-1');
      tick();

      expect(component.improvements()[0].action).toBe('');
    }));

    it('actionがundefinedの場合は空文字列になること', fakeAsync(() => {
      const reportWithoutAction: DailyReport = {
        ...mockDailyReport,
        improvements: [
          {
            ...mockDailyReport.improvements[0],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            action: undefined as any,
          },
        ],
      };
      dailyReportServiceSpy.getById.and.returnValue(of(reportWithoutAction));
      component.loadReport('report-1');
      tick();

      expect(component.improvements()[0].action).toBe('');
    }));

    it('isLoadingがfalseになること', () => {
      expect(component.isLoading()).toBeFalse();
    });

    it('404エラーの場合、適切なエラーメッセージが設定されること', fakeAsync(() => {
      dailyReportServiceSpy.getById.and.returnValue(
        throwError(() => ({ status: 404 }))
      );
      component.loadReport('report-1');
      tick();

      expect(component.errorMessage()).toBe('日報が見つかりません');
      expect(component.isLoading()).toBeFalse();
    }));

    it('403エラーの場合、適切なエラーメッセージが設定されること', fakeAsync(() => {
      dailyReportServiceSpy.getById.and.returnValue(
        throwError(() => ({ status: 403 }))
      );
      component.loadReport('report-1');
      tick();

      expect(component.errorMessage()).toBe('この日報へのアクセス権限がありません');
      expect(component.isLoading()).toBeFalse();
    }));

    it('その他のエラーの場合、適切なエラーメッセージが設定されること', fakeAsync(() => {
      dailyReportServiceSpy.getById.and.returnValue(
        throwError(() => ({ error: { message: 'サーバーエラー' } }))
      );
      component.loadReport('report-1');
      tick();

      expect(component.errorMessage()).toBe('サーバーエラー');
      expect(component.isLoading()).toBeFalse();
    }));

    it('エラーメッセージがない場合、デフォルトメッセージが設定されること', fakeAsync(() => {
      dailyReportServiceSpy.getById.and.returnValue(
        throwError(() => ({ error: {} }))
      );
      component.loadReport('report-1');
      tick();

      expect(component.errorMessage()).toBe('日報の読み込みに失敗しました');
      expect(component.isLoading()).toBeFalse();
    }));

    it('learningsがnullの場合は空文字列になること', fakeAsync(() => {
      const reportWithoutLearnings: DailyReport = {
        ...mockDailyReport,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        learnings: null as any,
      };
      dailyReportServiceSpy.getById.and.returnValue(of(reportWithoutLearnings));
      component.loadReport('report-1');
      tick();

      expect(component.form.get('learnings')?.value).toBe('');
    }));
  });

  describe('よかったこと管理', () => {
    beforeEach(() => {
      dailyReportServiceSpy.getById.and.returnValue(of(mockDailyReport));
      fixture.detectChanges();
    });

    it('addGoodPointで新しいよかったことを追加できること', () => {
      const initialLength = component.goodPoints().length;
      component.addGoodPoint();
      expect(component.goodPoints().length).toBe(initialLength + 1);
      expect(component.goodPoints()[initialLength]).toEqual({ content: '', factors: '' });
    });

    it('removeGoodPointでよかったことを削除できること', () => {
      const initialLength = component.goodPoints().length;
      component.removeGoodPoint(0);
      expect(component.goodPoints().length).toBe(initialLength - 1);
    });

    it('updateGoodPointでよかったことを更新できること', () => {
      component.updateGoodPoint(0, 'content', '更新後の内容');
      expect(component.goodPoints()[0].content).toBe('更新後の内容');
    });

    it('updateGoodPointで指定インデックス以外は変更されないこと', () => {
      component.addGoodPoint();
      component.updateGoodPoint(0, 'content', '1番目');
      component.updateGoodPoint(1, 'content', '2番目');
      expect(component.goodPoints()[0].content).toBe('1番目');
      expect(component.goodPoints()[1].content).toBe('2番目');
    });
  });

  describe('改善点管理', () => {
    beforeEach(() => {
      dailyReportServiceSpy.getById.and.returnValue(of(mockDailyReport));
      fixture.detectChanges();
    });

    it('addImprovementで新しい改善点を追加できること', () => {
      const initialLength = component.improvements().length;
      component.addImprovement();
      expect(component.improvements().length).toBe(initialLength + 1);
      expect(component.improvements()[initialLength]).toEqual({ content: '', action: '' });
    });

    it('removeImprovementで改善点を削除できること', () => {
      const initialLength = component.improvements().length;
      component.removeImprovement(0);
      expect(component.improvements().length).toBe(initialLength - 1);
    });

    it('updateImprovementで改善点を更新できること', () => {
      component.updateImprovement(0, 'content', '更新後の内容');
      expect(component.improvements()[0].content).toBe('更新後の内容');
    });

    it('updateImprovementで指定インデックス以外は変更されないこと', () => {
      component.addImprovement();
      component.updateImprovement(0, 'content', '1番目');
      component.updateImprovement(1, 'content', '2番目');
      expect(component.improvements()[0].content).toBe('1番目');
      expect(component.improvements()[1].content).toBe('2番目');
    });
  });

  describe('onCancel', () => {
    beforeEach(() => {
      dailyReportServiceSpy.getById.and.returnValue(of(mockDailyReport));
      component.reportId = 'report-1';
      fixture.detectChanges();
    });

    it('日報詳細画面に遷移すること', () => {
      component.onCancel();
      expect(router.navigate).toHaveBeenCalledWith(['/daily-reports', 'report-1']);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      dailyReportServiceSpy.getById.and.returnValue(of(mockDailyReport));
      component.reportId = 'report-1';
      fixture.detectChanges();
    });

    it('フォームが無効な場合、markAllAsTouchedを呼び出し、APIを呼ばないこと', () => {
      component.form.patchValue({ date: '', events: '' });
      const markSpy = spyOn(component.form, 'markAllAsTouched');

      component.onSubmit();

      expect(markSpy).toHaveBeenCalled();
      expect(dailyReportServiceSpy.update).not.toHaveBeenCalled();
    });

    it('reportIdがnullの場合、エラーメッセージが設定されること', () => {
      component.reportId = null;
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });

      component.onSubmit();

      expect(component.errorMessage()).toBe('日報IDが指定されていません');
      expect(dailyReportServiceSpy.update).not.toHaveBeenCalled();
    });

    it('更新が成功した場合、日報詳細画面に遷移すること', fakeAsync(() => {
      component.form.patchValue({ date: '2025-12-05', events: '更新後のイベント' });
      dailyReportServiceSpy.update.and.returnValue(of(mockDailyReport));

      component.onSubmit();
      tick();

      expect(dailyReportServiceSpy.update).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/daily-reports', 'report-1']);
    }));

    it('保存中はisSavingがtrueになること', fakeAsync(() => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      
      // Subjectを使って非同期的に値を発行する
      const subject = new Subject<DailyReport>();
      dailyReportServiceSpy.update.and.returnValue(subject.asObservable());

      component.onSubmit();

      // subscribeした直後はisSavingがtrue
      expect(component.isSaving()).toBeTrue();
      
      // レスポンスを発行
      subject.next(mockDailyReport);
      subject.complete();
      tick();
      
      // 完了後はisSavingがfalse
      expect(component.isSaving()).toBeFalse();
    }));

    it('更新が失敗した場合、エラーメッセージを設定すること', fakeAsync(() => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      dailyReportServiceSpy.update.and.returnValue(
        throwError(() => ({ error: { message: '更新に失敗しました' } }))
      );

      component.onSubmit();
      tick();

      expect(component.isSaving()).toBeFalse();
      expect(component.errorMessage()).toBe('更新に失敗しました');
    }));

    it('更新が失敗した場合、err.errorが存在しない場合はデフォルトメッセージを設定すること', fakeAsync(() => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      dailyReportServiceSpy.update.and.returnValue(
        throwError(() => ({ status: 500 }))
      );

      component.onSubmit();
      tick();

      expect(component.isSaving()).toBeFalse();
      expect(component.errorMessage()).toBe('日報の更新に失敗しました。もう一度お試しください。');
    }));

    it('更新が失敗した場合、err.error.messageが存在しない場合はデフォルトメッセージを設定すること', fakeAsync(() => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      dailyReportServiceSpy.update.and.returnValue(
        throwError(() => ({ error: {} }))
      );

      component.onSubmit();
      tick();

      expect(component.isSaving()).toBeFalse();
      expect(component.errorMessage()).toBe('日報の更新に失敗しました。もう一度お試しください。');
    }));

    it('learningsが空文字列の場合、undefinedがリクエストに含まれること', fakeAsync(() => {
      component.form.patchValue({
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: '',
      });
      dailyReportServiceSpy.update.and.returnValue(of(mockDailyReport));

      component.onSubmit();
      tick();

      expect(dailyReportServiceSpy.update).toHaveBeenCalledWith(
        'report-1',
        jasmine.objectContaining({
          learnings: undefined,
        })
      );
    }));

    it('よかったことと改善点がリクエストに含まれること', fakeAsync(() => {
      component.form.patchValue({
        date: '2025-12-05',
        events: '更新後のイベント',
        learnings: '更新後の学び',
      });
      component.addGoodPoint();
      component.updateGoodPoint(component.goodPoints().length - 1, 'content', '新しいよかったこと');
      component.addImprovement();
      component.updateImprovement(component.improvements().length - 1, 'content', '新しい改善点');

      dailyReportServiceSpy.update.and.returnValue(of(mockDailyReport));

      component.onSubmit();
      tick();

      expect(dailyReportServiceSpy.update).toHaveBeenCalledWith(
        'report-1',
        jasmine.objectContaining({
          goodPoints: jasmine.arrayContaining([
            jasmine.objectContaining({ content: '新しいよかったこと' }),
          ]),
          improvements: jasmine.arrayContaining([
            jasmine.objectContaining({ content: '新しい改善点' }),
          ]),
        })
      );
    }));
  });

  describe('getFieldError', () => {
    beforeEach(() => {
      dailyReportServiceSpy.getById.and.returnValue(of(mockDailyReport));
      fixture.detectChanges();
    });

    it('コントロールがnullの場合はnullを返す', () => {
      expect(component.getFieldError('nonExistent')).toBeNull();
    });

    it('touchedでない場合はnullを返す', () => {
      component.form.patchValue({ events: '' });
      expect(component.getFieldError('events')).toBeNull();
    });

    it('エラーがない場合はnullを返す', () => {
      component.form.patchValue({ events: 'テスト' });
      component.form.get('events')?.markAsTouched();
      expect(component.getFieldError('events')).toBeNull();
    });

    it('requiredエラーの場合は適切なメッセージを返す', () => {
      component.form.patchValue({ events: '' });
      component.form.get('events')?.markAsTouched();
      component.isSubmitted.set(true);
      expect(component.getFieldError('events')).toBe('この項目は必須です');
    });

    it('maxlengthエラーの場合は適切なメッセージを返す', () => {
      const longText = 'あ'.repeat(1001);
      component.form.patchValue({ events: longText });
      component.form.get('events')?.markAsTouched();
      component.isSubmitted.set(true);
      expect(component.getFieldError('events')).toBe('1000文字以内で入力してください');
    });

    it('未知のエラーの場合はnullを返す', () => {
      component.form.patchValue({ events: 'テスト' });
      component.form.get('events')?.markAsTouched();
      component.isSubmitted.set(true);
      // 手動でカスタムエラーを設定
      component.form.get('events')?.setErrors({ customError: true });
      expect(component.getFieldError('events')).toBeNull();
    });
  });
});

