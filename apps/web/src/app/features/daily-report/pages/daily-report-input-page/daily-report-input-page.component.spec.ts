import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Subject } from 'rxjs';
import { DailyReportInputPageComponent } from './daily-report-input-page.component';
import { DailyReportService } from '../../services/daily-report.service';
import { DailyReport } from '../../models/daily-report.model';
import { provideLucideIconsForTesting } from '../../../../shared/test-helpers/lucide-icons.helper';

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
      providers: [
        { provide: DailyReportService, useValue: dailyReportServiceSpy },
        provideLucideIconsForTesting(),
      ],
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
      expect(component.goodPoints().length).toBe(1);
      expect(component.goodPoints()[0]).toEqual({ content: '', factors: '' });
    });

    it('removeGoodPointでよかったことを削除できること', () => {
      component.addGoodPoint();
      component.addGoodPoint();
      expect(component.goodPoints().length).toBe(2);

      component.removeGoodPoint(0);
      expect(component.goodPoints().length).toBe(1);
    });

    it('updateGoodPointでよかったことを更新できること', () => {
      component.addGoodPoint();
      component.updateGoodPoint(0, 'content', 'テスト内容');
      expect(component.goodPoints()[0].content).toBe('テスト内容');
    });

    it('updateGoodPointで指定インデックス以外は変更されないこと', () => {
      component.addGoodPoint();
      component.addGoodPoint();
      component.updateGoodPoint(0, 'content', '1番目');
      component.updateGoodPoint(1, 'content', '2番目');
      expect(component.goodPoints()[0].content).toBe('1番目');
      expect(component.goodPoints()[1].content).toBe('2番目');
    });
  });

  describe('改善点管理', () => {
    it('addImprovementで新しい改善点を追加できること', () => {
      component.addImprovement();
      expect(component.improvements().length).toBe(1);
      expect(component.improvements()[0]).toEqual({ content: '', action: '' });
    });

    it('removeImprovementで改善点を削除できること', () => {
      component.addImprovement();
      component.addImprovement();
      expect(component.improvements().length).toBe(2);

      component.removeImprovement(0);
      expect(component.improvements().length).toBe(1);
    });

    it('updateImprovementで改善点を更新できること', () => {
      component.addImprovement();
      component.updateImprovement(0, 'action', 'テストアクション');
      expect(component.improvements()[0].action).toBe('テストアクション');
    });

    it('updateImprovementで指定インデックス以外は変更されないこと', () => {
      component.addImprovement();
      component.addImprovement();
      component.updateImprovement(0, 'content', '1番目');
      component.updateImprovement(1, 'content', '2番目');
      expect(component.improvements()[0].content).toBe('1番目');
      expect(component.improvements()[1].content).toBe('2番目');
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

    it('保存中はisLoadingがtrueになること', fakeAsync(() => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      
      // Subjectを使って非同期的に値を発行する
      const subject = new Subject<DailyReport>();
      dailyReportServiceSpy.create.and.returnValue(subject.asObservable());

      component.onSubmit();

      // subscribeした直後はisLoadingがtrue
      expect(component.isLoading()).toBeTrue();
      
      // レスポンスを発行
      subject.next(mockDailyReport);
      subject.complete();
      tick();
      
      // 完了後はisLoadingがfalse
      expect(component.isLoading()).toBeFalse();
    }));

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

    it('factorsとactionが空の場合はundefinedになること', fakeAsync(() => {
      component.form.patchValue({
        date: '2025-12-05',
        events: 'テストイベント',
      });
      component.addGoodPoint();
      component.updateGoodPoint(0, 'content', 'よかったこと');
      // factorsは空のまま
      component.addImprovement();
      component.updateImprovement(0, 'content', '改善点');
      // actionは空のまま

      dailyReportServiceSpy.create.and.returnValue(of(mockDailyReport));

      component.onSubmit();
      tick();

      expect(dailyReportServiceSpy.create).toHaveBeenCalledWith({
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: undefined,
        goodPoints: [{ content: 'よかったこと', factors: undefined }],
        improvements: [{ content: '改善点', action: undefined }],
      });
    }));

    it('APIエラーにメッセージがない場合はデフォルトメッセージを表示すること', fakeAsync(() => {
      component.form.patchValue({ date: '2025-12-05', events: 'テストイベント' });
      dailyReportServiceSpy.create.and.returnValue(
        throwError(() => ({ error: {} }))
      );

      component.onSubmit();
      tick();

      expect(component.errorMessage()).toBe('日報の保存に失敗しました。もう一度お試しください。');
    }));
  });

  describe('文字数カウント', () => {
    it('eventsの文字数を取得できること', () => {
      component.form.patchValue({ events: 'テスト' });
      expect(component.form.get('events')?.value.length).toBe(3);
    });

    it('learningsの文字数を取得できること', () => {
      component.form.patchValue({ learnings: 'テスト学び' });
      expect(component.form.get('learnings')?.value.length).toBe(5);
    });
  });

  describe('getFieldError', () => {
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
      expect(component.getFieldError('events')).toBe('この項目は必須です');
    });

    it('maxlengthエラーの場合は適切なメッセージを返す', () => {
      const longText = 'あ'.repeat(1001);
      component.form.patchValue({ events: longText });
      component.form.get('events')?.markAsTouched();
      expect(component.getFieldError('events')).toBe('1000文字以内で入力してください');
    });

    it('未知のエラーの場合はnullを返す', () => {
      component.form.patchValue({ events: 'テスト' });
      component.form.get('events')?.markAsTouched();
      // 手動でカスタムエラーを設定
      component.form.get('events')?.setErrors({ customError: true });
      expect(component.getFieldError('events')).toBeNull();
    });
  });
});

