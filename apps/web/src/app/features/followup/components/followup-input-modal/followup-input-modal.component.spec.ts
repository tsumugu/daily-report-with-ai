import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { FollowupInputModalComponent } from './followup-input-modal.component';
import { FollowupService } from '../../../../shared/services/followup.service';

describe('FollowupInputModalComponent', () => {
  let component: FollowupInputModalComponent;
  let fixture: ComponentFixture<FollowupInputModalComponent>;
  let followupService: jasmine.SpyObj<FollowupService>;

  beforeEach(async () => {
    const followupServiceSpy = jasmine.createSpyObj('FollowupService', [
      'addGoodPointFollowup',
      'addImprovementFollowup',
    ]);

    await TestBed.configureTestingModule({
      imports: [FollowupInputModalComponent, ReactiveFormsModule],
      providers: [{ provide: FollowupService, useValue: followupServiceSpy }],
    }).compileComponents();

    followupService = TestBed.inject(FollowupService) as jasmine.SpyObj<FollowupService>;
    fixture = TestBed.createComponent(FollowupInputModalComponent);
    component = fixture.componentInstance;
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('itemTypeがgoodPointの場合、適切なステータスオプションが設定されること', () => {
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
    component.ngOnInit();
    expect(component.statusOptions.length).toBe(4);
    expect(component.statusOptions.map((o) => o.value)).toContain('再現成功');
  });

  it('itemTypeがimprovementの場合、適切なステータスオプションが設定されること', () => {
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
    component.ngOnInit();
    expect(component.statusOptions.length).toBe(4);
    expect(component.statusOptions.map((o) => o.value)).toContain('完了');
  });

  it('ステータスが「再現成功」の場合、日付が必須になること', () => {
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
    component.ngOnInit();
    component.form.patchValue({ status: '再現成功' });
    const dateControl = component.form.get('date');
    expect(dateControl?.hasError('required')).toBe(true);
  });

  it('フォーム送信時、よかったことのフォローアップが保存されること', () => {
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
    component.ngOnInit();
    component.form.patchValue({
      status: '進行中',
      memo: 'テストメモ',
    });

    followupService.addGoodPointFollowup.and.returnValue(
      of({
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '進行中',
        memo: 'テストメモ',
        date: null,
        createdAt: '2025-12-10T12:00:00Z',
        updatedAt: '2025-12-10T12:00:00Z',
      })
    );

    spyOn(component.saved, 'emit');
    spyOn(component, 'onClose');

    component.onSubmit();

    expect(followupService.addGoodPointFollowup).toHaveBeenCalledWith('gp-1', jasmine.objectContaining({
      status: '進行中',
      memo: 'テストメモ',
    }));
    expect(component.saved.emit).toHaveBeenCalled();
    expect(component.onClose).toHaveBeenCalled();
  });

  it('フォーム送信時、改善点のフォローアップが保存されること', () => {
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
    component.ngOnInit();
    component.form.patchValue({
      status: '完了',
      date: '2025-12-10',
    });

    followupService.addImprovementFollowup.and.returnValue(
      of({
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        status: '完了',
        memo: null,
        date: '2025-12-10',
        createdAt: '2025-12-10T12:00:00Z',
        updatedAt: '2025-12-10T12:00:00Z',
      })
    );

    spyOn(component.saved, 'emit');
    component.onSubmit();

    expect(followupService.addImprovementFollowup).toHaveBeenCalledWith('imp-1', jasmine.objectContaining({
      status: '完了',
      date: '2025-12-10',
    }));
    expect(component.saved.emit).toHaveBeenCalled();
  });

  it('フォームが無効の場合、送信されないこと', () => {
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
    component.ngOnInit();
    component.form.patchValue({ status: '' });

    component.onSubmit();

    expect(followupService.addGoodPointFollowup).not.toHaveBeenCalled();
  });

  it('エラー時、エラーメッセージが表示されること', () => {
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
    component.ngOnInit();
    component.form.patchValue({ status: '進行中' });

    followupService.addGoodPointFollowup.and.returnValue(
      throwError(() => ({ error: { message: 'エラーメッセージ' } }))
    );

    component.onSubmit();

    expect(component.errorMessage).toBe('エラーメッセージ');
    expect(component.isSubmitting).toBe(false);
  });

  it('エラー時、エラーメッセージがない場合はデフォルトメッセージが表示されること', () => {
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
    component.ngOnInit();
    component.form.patchValue({ status: '進行中' });

    followupService.addGoodPointFollowup.and.returnValue(
      throwError(() => ({}))
    );

    component.onSubmit();

    expect(component.errorMessage).toBe('フォローアップの保存に失敗しました');
    expect(component.isSubmitting).toBe(false);
  });

  it('onClose()が呼ばれた場合、closedイベントが発火されること', () => {
    spyOn(component.closed, 'emit');
    component.onClose();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('modalTitleがgoodPointの場合、「よかったことのフォローアップ」を返すこと', () => {
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
    expect(component.modalTitle).toBe('よかったことのフォローアップ');
  });

  it('modalTitleがimprovementの場合、「改善点のフォローアップ」を返すこと', () => {
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
    expect(component.modalTitle).toBe('改善点のフォローアップ');
  });

  it('dateLabelがgoodPointの場合、「再現日」を返すこと', () => {
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
    component.ngOnInit();
    expect(component.dateLabel).toBe('再現日');
  });

  it('dateLabelがimprovementの場合、「完了日」を返すこと', () => {
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
    component.ngOnInit();
    expect(component.dateLabel).toBe('完了日');
  });

  it('ステータスが「完了」の場合、日付が必須になること', () => {
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
    component.ngOnInit();
    component.form.patchValue({ status: '完了' });
    const dateControl = component.form.get('date');
    expect(dateControl?.hasError('required')).toBe(true);
    expect(component.dateRequired).toBe(true);
  });

  it('ステータスが「再現成功」または「完了」以外の場合、日付は必須でないこと', () => {
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
    component.ngOnInit();
    component.form.patchValue({ status: '進行中' });
    const dateControl = component.form.get('date');
    expect(dateControl?.hasError('required')).toBeFalsy();
    expect(component.dateRequired).toBe(false);
  });

  it('memoLabelがgoodPointの場合、「再現メモ」を返すこと', () => {
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
    expect(component.memoLabel).toBe('再現メモ');
  });

  it('memoLabelがimprovementの場合、「実施内容」を返すこと', () => {
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
    expect(component.memoLabel).toBe('実施内容');
  });

  it('memoPlaceholderがgoodPointの場合、適切なプレースホルダーを返すこと', () => {
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
    expect(component.memoPlaceholder).toBe('どのように再現したか、できなかった理由などを記録してください');
  });

  it('memoPlaceholderがimprovementの場合、適切なプレースホルダーを返すこと', () => {
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
    expect(component.memoPlaceholder).toBe('どのようなアクションを実施したか、できなかった理由などを記録してください');
  });
});

