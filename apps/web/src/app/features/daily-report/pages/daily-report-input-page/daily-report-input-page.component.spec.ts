import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DailyReportInputPageComponent } from './daily-report-input-page.component';
import { DailyReportService } from '../../services/daily-report.service';

describe('DailyReportInputPageComponent', () => {
  let component: DailyReportInputPageComponent;
  let fixture: ComponentFixture<DailyReportInputPageComponent>;
  let dailyReportServiceSpy: jasmine.SpyObj<DailyReportService>;
  let router: Router;

  const mockDailyReport = {
    id: 'report-1',
    userId: 'user-1',
    date: '2025-12-05',
    events: 'テストイベント',
    learnings: 'テスト学び',
    goodPoints: [],
    improvements: [],
    createdAt: '2025-12-05T00:00:00Z',
    updatedAt: '2025-12-05T00:00:00Z',
  };

  beforeEach(async () => {
    dailyReportServiceSpy = jasmine.createSpyObj('DailyReportService', ['create']);

    await TestBed.configureTestingModule({
      imports: [DailyReportInputPageComponent, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      providers: [{ provide: DailyReportService, useValue: dailyReportServiceSpy }],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(DailyReportInputPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('初期状態', () => {
    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('フォームが初期化されていること', () => {
      expect(component.form).toBeTruthy();
      expect(component.form.get('date')).toBeTruthy();
      expect(component.form.get('events')).toBeTruthy();
      expect(component.form.get('learnings')).toBeTruthy();
    });

    it('日付のデフォルト値が今日であること', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(component.form.get('date')?.value).toBe(today);
    });

    it('goodPointsとimprovementsが空配列で初期化されていること', () => {
      expect(component.goodPoints()).toEqual([]);
      expect(component.improvements()).toEqual([]);
    });

    it('isLoadingがfalseであること', () => {
      expect(component.isLoading()).toBeFalse();
    });

    it('errorMessageがnullであること', () => {
      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('フォームバリデーション', () => {
    it('dateが空の場合、フォームは無効であること', () => {
      component.form.patchValue({ date: '', events: 'テスト' });
      expect(component.form.invalid).toBeTrue();
    });

    it('eventsが空の場合、フォームは無効であること', () => {
      component.form.patchValue({ date: '2025-12-05', events: '' });
      expect(component.form.invalid).toBeTrue();
    });

    it('eventsが1000文字を超える場合、フォームは無効であること', () => {
      const longText = 'あ'.repeat(1001);
      component.form.patchValue({ date: '2025-12-05', events: longText });
      expect(component.form.get('events')?.hasError('maxlength')).toBeTrue();
    });

    it('有効な入力の場合、フォームは有効であること', () => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      expect(component.form.valid).toBeTrue();
    });
  });

  describe('よかったこと管理', () => {
    it('addGoodPointで新しいよかったことを追加できること', () => {
      component.addGoodPoint();
      expect(component.goodPoints()).toHaveLength(1);
      expect(component.goodPoints()[0]).toEqual({ content: '', factors: '' });
    });

    it('removeGoodPointでよかったことを削除できること', () => {
      component.addGoodPoint();
      component.addGoodPoint();
      expect(component.goodPoints()).toHaveLength(2);

      component.removeGoodPoint(0);
      expect(component.goodPoints()).toHaveLength(1);
    });

    it('updateGoodPointでよかったことを更新できること', () => {
      component.addGoodPoint();
      component.updateGoodPoint(0, 'content', 'テスト内容');
      expect(component.goodPoints()[0].content).toBe('テスト内容');
    });
  });

  describe('改善点管理', () => {
    it('addImprovementで新しい改善点を追加できること', () => {
      component.addImprovement();
      expect(component.improvements()).toHaveLength(1);
      expect(component.improvements()[0]).toEqual({ content: '', action: '' });
    });

    it('removeImprovementで改善点を削除できること', () => {
      component.addImprovement();
      component.addImprovement();
      expect(component.improvements()).toHaveLength(2);

      component.removeImprovement(0);
      expect(component.improvements()).toHaveLength(1);
    });

    it('updateImprovementで改善点を更新できること', () => {
      component.addImprovement();
      component.updateImprovement(0, 'action', 'テストアクション');
      expect(component.improvements()[0].action).toBe('テストアクション');
    });
  });

  describe('onSubmit', () => {
    it('フォームが無効な場合、markAllAsTouchedを呼び出し、APIを呼ばないこと', () => {
      component.form.patchValue({ date: '', events: '' });
      const markSpy = spyOn(component.form, 'markAllAsTouched');

      component.onSubmit();

      expect(markSpy).toHaveBeenCalled();
      expect(dailyReportServiceSpy.create).not.toHaveBeenCalled();
    });

    it('保存が成功した場合、一覧画面に遷移すること', fakeAsync(() => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      dailyReportServiceSpy.create.and.returnValue(of(mockDailyReport));

      component.onSubmit();
      tick();

      expect(dailyReportServiceSpy.create).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/daily-reports']);
    }));

    it('保存中はisLoadingがtrueになること', () => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      dailyReportServiceSpy.create.and.returnValue(of(mockDailyReport));

      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('保存が失敗した場合、エラーメッセージを設定すること', fakeAsync(() => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      dailyReportServiceSpy.create.and.returnValue(
        throwError(() => ({ error: { message: 'この日付の日報は既に存在します' } }))
      );

      component.onSubmit();
      tick();

      expect(component.isLoading()).toBeFalse();
      expect(component.errorMessage()).toBe('この日付の日報は既に存在します');
    }));

    it('よかったことと改善点がリクエストに含まれること', fakeAsync(() => {
      component.form.patchValue({
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: 'テスト学び',
      });
      component.addGoodPoint();
      component.updateGoodPoint(0, 'content', 'よかったこと');
      component.updateGoodPoint(0, 'factors', '要因');
      component.addImprovement();
      component.updateImprovement(0, 'content', '改善点');
      component.updateImprovement(0, 'action', 'アクション');

      dailyReportServiceSpy.create.and.returnValue(of(mockDailyReport));

      component.onSubmit();
      tick();

      expect(dailyReportServiceSpy.create).toHaveBeenCalledWith({
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: 'テスト学び',
        goodPoints: [{ content: 'よかったこと', factors: '要因' }],
        improvements: [{ content: '改善点', action: 'アクション' }],
      });
    }));
  });

  describe('文字数カウント', () => {
    it('eventsの文字数を取得できること', () => {
      component.form.patchValue({ events: 'テスト' });
      expect(component.eventsCharCount()).toBe(3);
    });

    it('learningsの文字数を取得できること', () => {
      component.form.patchValue({ learnings: 'テスト学び' });
      expect(component.learningsCharCount()).toBe(5);
    });
  });
});

