import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { GoalDetailPageComponent } from './goal-detail-page.component';
import { GoalService } from '../../services/goal.service';
import { GoalDetailResponse } from '../../models/goal.model';

describe('GoalDetailPageComponent', () => {
  let component: GoalDetailPageComponent;
  let fixture: ComponentFixture<GoalDetailPageComponent>;
  let goalService: jasmine.SpyObj<GoalService>;
  let router: jasmine.SpyObj<Router>;

  const mockGoal: GoalDetailResponse = {
    id: '1',
    userId: 'user1',
    name: 'テスト目標',
    description: 'テスト説明',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    parentId: null,
    goalType: 'skill',
    successCriteria: 'テスト基準',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    parent: null,
    children: [],
  };

  beforeEach(async () => {
    const goalServiceSpy = jasmine.createSpyObj('GoalService', ['getGoal', 'deleteGoal']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      params: of({ id: '1' }),
      snapshot: {
        params: { id: '1' },
        paramMap: {
          get: (key: string) => (key === 'id' ? '1' : null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [GoalDetailPageComponent],
      providers: [
        { provide: GoalService, useValue: goalServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalDetailPageComponent);
    component = fixture.componentInstance;
    goalService = TestBed.inject(GoalService) as jasmine.SpyObj<GoalService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load goal on init', () => {
    goalService.getGoal.and.returnValue(of(mockGoal));
    component.ngOnInit();

    expect(goalService.getGoal).toHaveBeenCalled();
    // 実際のテストでは、ActivatedRouteのモックが必要
  });

  it('should navigate to edit page on edit', () => {
    component.goal.set(mockGoal);
    component.onEdit();
    expect(router.navigate).toHaveBeenCalledWith(['/goals', '1', 'edit']);
  });

  it('should navigate to create child page on create child', () => {
    component.goal.set(mockGoal);
    component.onCreateChild();
    expect(router.navigate).toHaveBeenCalledWith(['/goals/new'], {
      queryParams: { parentId: '1' },
    });
  });

  it('should delete goal on delete', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    goalService.deleteGoal.and.returnValue(of({ message: '目標を削除しました' }));
    component.goal.set(mockGoal);

    component.onDelete();

    expect(goalService.deleteGoal).toHaveBeenCalledWith('1');
    expect(router.navigate).toHaveBeenCalledWith(['/goals']);
  });

  it('should return correct goal type label', () => {
    expect(component.getGoalTypeLabel('skill')).toBe('スキル習得');
    expect(component.getGoalTypeLabel('project')).toBe('プロジェクト完了');
    expect(component.getGoalTypeLabel('habit')).toBe('習慣形成');
    expect(component.getGoalTypeLabel('other')).toBe('その他');
    expect(component.getGoalTypeLabel('unknown')).toBe('unknown');
    expect(component.getGoalTypeLabel(null)).toBe('-');
  });

  it('should handle error when loading goal', () => {
    goalService.getGoal.and.returnValue(
      throwError(() => ({ error: { message: 'エラーが発生しました' } }))
    );
    component.loadGoal('1');

    expect(component.errorMessage()).toBe('エラーが発生しました');
    expect(component.isLoading()).toBe(false);
  });

  it('should handle error when loading goal without message', () => {
    goalService.getGoal.and.returnValue(throwError(() => ({})));
    component.loadGoal('1');

    expect(component.errorMessage()).toBe('目標の取得に失敗しました');
    expect(component.isLoading()).toBe(false);
  });

  it('should not delete goal when confirm is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.goal.set(mockGoal);

    component.onDelete();

    expect(goalService.deleteGoal).not.toHaveBeenCalled();
  });

  it('should not delete goal when goal is null', () => {
    component.goal.set(null);
    component.onDelete();

    expect(goalService.deleteGoal).not.toHaveBeenCalled();
  });

  it('should handle error when deleting goal', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    goalService.deleteGoal.and.returnValue(
      throwError(() => ({ error: { message: '削除エラー' } }))
    );
    component.goal.set(mockGoal);

    component.onDelete();

    expect(component.errorMessage()).toBe('削除エラー');
    expect(component.isDeleting()).toBe(false);
  });

  it('should handle error when deleting goal without message', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    goalService.deleteGoal.and.returnValue(throwError(() => ({})));
    component.goal.set(mockGoal);

    component.onDelete();

    expect(component.errorMessage()).toBe('目標の削除に失敗しました');
    expect(component.isDeleting()).toBe(false);
  });

  it('should not navigate to edit when goal is null', () => {
    component.goal.set(null);
    component.onEdit();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not navigate to create child when goal is null', () => {
    component.goal.set(null);
    component.onCreateChild();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should return correct goal level', () => {
    component.goal.set(mockGoal);
    expect(component.getGoalLevel()).toBe('long');

    const goalWithParent: GoalDetailResponse = {
      ...mockGoal,
      parentId: 'parent-1',
    };
    component.goal.set(goalWithParent);
    expect(component.getGoalLevel()).toBe('medium');

    component.goal.set(null);
    expect(component.getGoalLevel()).toBe('long');
  });

  it('should return isShortTermGoal correctly', () => {
    component.goal.set(mockGoal);
    expect(component.isShortTermGoal).toBe(true);

    const goalWithChildren: GoalDetailResponse = {
      ...mockGoal,
      children: [{ id: 'child-1', name: '子目標' }],
    };
    component.goal.set(goalWithChildren);
    expect(component.isShortTermGoal).toBe(false);

    component.goal.set(null);
    expect(component.isShortTermGoal).toBe(false);
  });


  it('should not load goal when id is not provided', () => {
    const activatedRouteSpy = {
      params: of({}),
      snapshot: {
        params: {},
        paramMap: {
          get: (_key: string) => null,
        },
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [GoalDetailPageComponent],
      providers: [
        { provide: GoalService, useValue: goalService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    });
    fixture = TestBed.createComponent(GoalDetailPageComponent);
    component = fixture.componentInstance;

    component.ngOnInit();

    expect(goalService.getGoal).not.toHaveBeenCalled();
  });

  it('should clear toast message after timeout', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    goalService.deleteGoal.and.returnValue(of({ message: '目標を削除しました' }));
    component.goal.set(mockGoal);

    component.onDelete();
    expect(component.toastMessage()).toBe('目標を削除しました');

    tick(3000);
    expect(component.toastMessage()).toBeNull();
  }));
});

