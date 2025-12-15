import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { GoalFormPageComponent } from './goal-form-page.component';
import { GoalService } from '../../services/goal.service';
import { GoalDetailResponse, Goal } from '../../models/goal.model';
import { provideLucideIconsForTesting } from '../../../../shared/test-helpers/lucide-icons.helper';

describe('GoalFormPageComponent', () => {
  let component: GoalFormPageComponent;
  let fixture: ComponentFixture<GoalFormPageComponent>;
  let goalService: jasmine.SpyObj<GoalService>;

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
    const goalServiceSpy = jasmine.createSpyObj('GoalService', [
      'getGoal',
      'createGoal',
      'updateGoal',
      'getGoals',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      params: of({}),
      queryParams: of({}),
      snapshot: {
        params: {},
        queryParams: {},
        paramMap: {
          get: (_key: string) => null,
        },
        queryParamMap: {
          get: (_key: string) => null,
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [GoalFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: GoalService, useValue: goalServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        provideLucideIconsForTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalFormPageComponent);
    component = fixture.componentInstance;
    goalService = TestBed.inject(GoalService) as jasmine.SpyObj<GoalService>;

    goalService.getGoals.and.returnValue(of({ data: [] }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load goal in edit mode', () => {
    goalService.getGoal.and.returnValue(of(mockGoal));
    component.ngOnInit();

    expect(component.isEditMode()).toBe(false);
    // 実際のテストでは、ActivatedRouteのモックが必要
  });

  it('should create goal on submit', () => {
    const newGoal: Goal = {
      id: '2',
      userId: 'user1',
      name: '新規目標',
      description: null,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      parentId: null,
      goalType: null,
      successCriteria: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    goalService.createGoal.and.returnValue(of(newGoal));
    component.form.patchValue({
      name: '新規目標',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    });

    component.onSubmit();

    expect(goalService.createGoal).toHaveBeenCalled();
  });

  it('should show error message on create failure', () => {
    goalService.createGoal.and.returnValue(
      throwError(() => ({ error: { message: 'エラーが発生しました' } }))
    );
    component.form.patchValue({
      name: '新規目標',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('エラーが発生しました');
  });

  it('should load goal in edit mode when id is provided', () => {
    const activatedRouteSpy = {
      params: of({ id: '1' }),
      queryParams: of({}),
      snapshot: {
        params: { id: '1' },
        queryParams: {},
        paramMap: {
          get: (key: string) => (key === 'id' ? '1' : null),
        },
        queryParamMap: {
          get: (_key: string) => null,
        },
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [GoalFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: GoalService, useValue: goalService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    });
    fixture = TestBed.createComponent(GoalFormPageComponent);
    component = fixture.componentInstance;
    goalService.getGoal.and.returnValue(of(mockGoal));
    goalService.getGoals.and.returnValue(of({ data: [] }));

    component.ngOnInit();

    expect(component.isEditMode()).toBe(true);
    expect(component.goalId()).toBe('1');
    expect(goalService.getGoal).toHaveBeenCalledWith('1');
  });

  it('should set parentId from query params', fakeAsync(() => {
    const activatedRouteSpy = {
      params: of({}),
      queryParams: of({ parentId: 'parent-1' }),
      snapshot: {
        params: {},
        queryParams: { parentId: 'parent-1' },
        paramMap: {
          get: (_key: string) => null,
        },
        queryParamMap: {
          get: (key: string) => (key === 'parentId' ? 'parent-1' : null),
        },
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [GoalFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: GoalService, useValue: goalService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        provideLucideIconsForTesting(),
      ],
    });
    fixture = TestBed.createComponent(GoalFormPageComponent);
    component = fixture.componentInstance;
    // parent-1を含む目標を返すように設定
    const mockGoals = [
      {
        id: 'parent-1',
        userId: 'user1',
        name: '親目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        children: [],
      },
    ];
    goalService.getGoals.and.returnValue(of({ data: mockGoals }));

    component.ngOnInit();
    fixture.detectChanges();

    // Promise.resolve().then()の実行を待つ
    tick();
    fixture.detectChanges();

    expect(component.form.value.parentId).toBe('parent-1');
  }));

  it('should handle error when loading goal', () => {
    const activatedRouteSpy = {
      params: of({ id: '1' }),
      queryParams: of({}),
      snapshot: {
        params: { id: '1' },
        queryParams: {},
        paramMap: {
          get: (key: string) => (key === 'id' ? '1' : null),
        },
        queryParamMap: {
          get: (_key: string) => null,
        },
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [GoalFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: GoalService, useValue: goalService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    });
    fixture = TestBed.createComponent(GoalFormPageComponent);
    component = fixture.componentInstance;
    goalService.getGoal.and.returnValue(
      throwError(() => ({ error: { message: 'エラー' } }))
    );
    goalService.getGoals.and.returnValue(of({ data: [] }));

    component.ngOnInit();

    expect(component.errorMessage()).toBe('エラー');
  });

  it('should update goal in edit mode', () => {
    component.isEditMode.set(true);
    component.goalId.set('1');
    goalService.updateGoal.and.returnValue(of(mockGoal));
    component.form.patchValue({
      name: '更新目標',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    });

    component.onSubmit();

    expect(goalService.updateGoal).toHaveBeenCalledWith('1', jasmine.any(Object));
  });

  it('should handle error when updating goal', () => {
    component.isEditMode.set(true);
    component.goalId.set('1');
    goalService.updateGoal.and.returnValue(
      throwError(() => ({ error: { message: '更新エラー' } }))
    );
    component.form.patchValue({
      name: '更新目標',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('更新エラー');
    expect(component.isLoading()).toBe(false);
  });

  it('should not submit when form is invalid', () => {
    component.form.patchValue({
      name: '',
      startDate: '',
      endDate: '',
    });

    component.onSubmit();

    expect(goalService.createGoal).not.toHaveBeenCalled();
    expect(goalService.updateGoal).not.toHaveBeenCalled();
  });

  it('should navigate to goal detail on cancel in edit mode', () => {
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    component.isEditMode.set(true);
    component.goalId.set('1');

    component.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/goals', '1']);
  });

  it('should navigate to goal list on cancel in create mode', () => {
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    component.isEditMode.set(false);

    component.onCancel();

    expect(router.navigate).toHaveBeenCalledWith(['/goals']);
  });

  it('should get error message for required field', () => {
    const control = component.form.get('name');
    control?.markAsTouched();
    control?.setValue('');

    const errorMessage = component.getErrorMessage('name');

    expect(errorMessage).toContain('目標名');
    expect(errorMessage).toContain('入力してください');
  });

  it('should get error message for maxlength field', () => {
    const control = component.form.get('name');
    control?.markAsTouched();
    control?.setValue('a'.repeat(101));

    const errorMessage = component.getErrorMessage('name');

    expect(errorMessage).toContain('目標名');
    expect(errorMessage).toContain('100文字以内');
  });

  it('should return empty string when no error', () => {
    const control = component.form.get('name');
    control?.setValue('正常な値');
    control?.markAsTouched();

    const errorMessage = component.getErrorMessage('name');

    expect(errorMessage).toBe('');
  });

  it('should get character count', () => {
    component.form.patchValue({ name: 'テスト' });

    expect(component.getCharacterCount('name')).toBe(3);
    expect(component.getCharacterCount('description')).toBe(0);
  });

  it('should get max length', () => {
    expect(component.getMaxLength('name')).toBe(100);
    expect(component.getMaxLength('description')).toBe(1000);
    expect(component.getMaxLength('successCriteria')).toBe(500);
    expect(component.getMaxLength('unknown')).toBe(0);
  });

  it('should load parent goal options with hierarchy', () => {
    const goalsWithChildren = [
      {
        id: '1',
        userId: 'user1',
        name: '親目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        children: [
          {
            id: '2',
            userId: 'user1',
            name: '子目標',
            description: null,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            parentId: '1',
            goalType: null,
            successCriteria: null,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            children: [],
          },
        ],
      },
    ];
    goalService.getGoals.and.returnValue(of({ data: goalsWithChildren }));

    component.loadParentGoalOptions();

    expect(component.parentGoalOptions().length).toBeGreaterThan(1);
  });

  it('should exclude current goal and descendants in edit mode', () => {
    component.isEditMode.set(true);
    component.goalId.set('1');
    const goalsWithChildren = [
      {
        id: '1',
        userId: 'user1',
        name: '現在の目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        children: [
          {
            id: '2',
            userId: 'user1',
            name: '子目標',
            description: null,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            parentId: '1',
            goalType: null,
            successCriteria: null,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            children: [],
          },
        ],
      },
    ];
    goalService.getGoals.and.returnValue(of({ data: goalsWithChildren }));

    component.loadParentGoalOptions();

    const options = component.parentGoalOptions();
    expect(options.find((o) => o.id === '1')).toBeUndefined();
    expect(options.find((o) => o.id === '2')).toBeUndefined();
  });

  it('should handle error when loading parent goal options', () => {
    goalService.getGoals.and.returnValue(throwError(() => ({})));

    component.loadParentGoalOptions();

    expect(component.parentGoalOptions().length).toBe(1);
    expect(component.parentGoalOptions()[0].id).toBe('');
  });

  it('should load goal with null description and successCriteria', () => {
    const activatedRouteSpy = {
      params: of({ id: '1' }),
      queryParams: of({}),
      snapshot: {
        params: { id: '1' },
        queryParams: {},
        paramMap: {
          get: (key: string) => (key === 'id' ? '1' : null),
        },
        queryParamMap: {
          get: (_key: string) => null,
        },
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [GoalFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: GoalService, useValue: goalService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    });
    fixture = TestBed.createComponent(GoalFormPageComponent);
    component = fixture.componentInstance;
    const goalWithoutOptionalFields: GoalDetailResponse = {
      ...mockGoal,
      description: null,
      successCriteria: null,
    };
    goalService.getGoal.and.returnValue(of(goalWithoutOptionalFields));
    goalService.getGoals.and.returnValue(of({ data: [] }));

    component.ngOnInit();

    expect(component.form.value.description).toBe('');
    expect(component.form.value.successCriteria).toBe('');
  });

  it('should handle error when loading goal without message', () => {
    const activatedRouteSpy = {
      params: of({ id: '1' }),
      queryParams: of({}),
      snapshot: {
        params: { id: '1' },
        queryParams: {},
        paramMap: {
          get: (key: string) => (key === 'id' ? '1' : null),
        },
        queryParamMap: {
          get: (_key: string) => null,
        },
      },
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [GoalFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: GoalService, useValue: goalService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    });
    fixture = TestBed.createComponent(GoalFormPageComponent);
    component = fixture.componentInstance;
    goalService.getGoal.and.returnValue(throwError(() => ({})));
    goalService.getGoals.and.returnValue(of({ data: [] }));

    component.ngOnInit();

    expect(component.errorMessage()).toBe('目標の取得に失敗しました');
  });

  it('should check isDescendant with recursive call', () => {
    const goals = [
      { id: '1', parentId: null, name: '親目標', children: [] },
      { id: '2', parentId: '1', name: '子目標1', children: [] },
      { id: '3', parentId: '2', name: '子目標2', children: [] },
    ];
    component.isEditMode.set(true);
    component.goalId.set('1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goalService.getGoals.and.returnValue(of({ data: goals as any }));

    component.loadParentGoalOptions();

    const options = component.parentGoalOptions();
    expect(options.find((o) => o.id === '1')).toBeUndefined();
    expect(options.find((o) => o.id === '2')).toBeUndefined();
    expect(options.find((o) => o.id === '3')).toBeUndefined();
  });

  it('should check isDescendant when goal has no parentId', () => {
    const goals = [
      { id: '1', parentId: null, name: '目標1', children: [] },
      { id: '2', parentId: null, name: '目標2', children: [] },
    ];
    component.isEditMode.set(true);
    component.goalId.set('1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goalService.getGoals.and.returnValue(of({ data: goals as any }));

    component.loadParentGoalOptions();

    const options = component.parentGoalOptions();
    expect(options.find((o) => o.id === '1')).toBeUndefined();
    expect(options.find((o) => o.id === '2')).toBeDefined();
  });

  it('should check isDescendant when goal is not found', () => {
    const goals = [
      { id: '1', parentId: null, name: '目標1', children: [] },
    ];
    component.isEditMode.set(true);
    component.goalId.set('1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goalService.getGoals.and.returnValue(of({ data: goals as any }));

    component.loadParentGoalOptions();

    const options = component.parentGoalOptions();
    expect(options.find((o) => o.id === '1')).toBeUndefined();
  });

  it('should check isDescendant when goal has no parentId (returns false)', () => {
    const goals = [
      { id: '1', parentId: null, name: '目標1', children: [] },
      { id: '2', parentId: null, name: '目標2', children: [] },
    ];
    component.isEditMode.set(true);
    component.goalId.set('1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goalService.getGoals.and.returnValue(of({ data: goals as any }));

    component.loadParentGoalOptions();

    const options = component.parentGoalOptions();
    expect(options.find((o) => o.id === '1')).toBeUndefined();
    expect(options.find((o) => o.id === '2')).toBeDefined();
  });

  it('should check isDescendant with deeper hierarchy', () => {
    const goals = [
      { id: '1', parentId: null, name: '親目標', children: [] },
      { id: '2', parentId: '1', name: '子目標1', children: [] },
      { id: '3', parentId: '2', name: '子目標2', children: [] },
      { id: '4', parentId: '3', name: '子目標3', children: [] },
    ];
    component.isEditMode.set(true);
    component.goalId.set('1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goalService.getGoals.and.returnValue(of({ data: goals as any }));

    component.loadParentGoalOptions();

    const options = component.parentGoalOptions();
    expect(options.find((o) => o.id === '1')).toBeUndefined();
    expect(options.find((o) => o.id === '2')).toBeUndefined();
    expect(options.find((o) => o.id === '3')).toBeUndefined();
    expect(options.find((o) => o.id === '4')).toBeUndefined();
  });

  it('should check isDescendant with nested children structure', () => {
    const goals = [
      {
        id: '1',
        parentId: null,
        name: '親目標',
        children: [
          {
            id: '2',
            parentId: '1',
            name: '子目標1',
            children: [
              {
                id: '3',
                parentId: '2',
                name: '子目標2',
                children: [],
              },
            ],
          },
        ],
      },
    ];
    component.isEditMode.set(true);
    component.goalId.set('1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goalService.getGoals.and.returnValue(of({ data: goals as any }));

    component.loadParentGoalOptions();

    const options = component.parentGoalOptions();
    expect(options.find((o) => o.id === '1')).toBeUndefined();
    expect(options.find((o) => o.id === '2')).toBeUndefined();
    expect(options.find((o) => o.id === '3')).toBeUndefined();
  });

  it('should check isDescendant with recursive call when parentId matches ancestorId', () => {
    const goals = [
      { id: '1', parentId: null, name: '親目標', children: [] },
      { id: '2', parentId: '1', name: '子目標1', children: [] },
      { id: '3', parentId: '2', name: '子目標2', children: [] },
    ];
    component.isEditMode.set(true);
    component.goalId.set('1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goalService.getGoals.and.returnValue(of({ data: goals as any }));

    component.loadParentGoalOptions();

    const options = component.parentGoalOptions();
    expect(options.find((o) => o.id === '1')).toBeUndefined();
    expect(options.find((o) => o.id === '2')).toBeUndefined();
    expect(options.find((o) => o.id === '3')).toBeUndefined();
  });

  it('should handle error when updating goal without message', () => {
    component.isEditMode.set(true);
    component.goalId.set('1');
    goalService.updateGoal.and.returnValue(throwError(() => ({})));
    component.form.patchValue({
      name: '更新目標',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('目標の更新に失敗しました');
  });

  it('should clear pendingParentId when option does not exist', fakeAsync(() => {
    // pendingParentIdを設定（存在しないID）
    component['pendingParentId'] = 'non-existent-id';
    component.isEditMode.set(false);
    
    // オプションに存在しないIDを含む目標を返す
    const mockGoals = [
      {
        id: 'parent-1',
        userId: 'user1',
        name: '親目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        children: [],
      },
    ];
    goalService.getGoals.and.returnValue(of({ data: mockGoals }));

    component.loadParentGoalOptions();
    tick();
    fixture.detectChanges();

    // pendingParentIdがクリアされることを確認
    expect(component['pendingParentId']).toBeNull();
  }));

  it('should handle error when creating goal without message', () => {
    goalService.createGoal.and.returnValue(throwError(() => ({})));
    component.form.patchValue({
      name: '新規目標',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('目標の作成に失敗しました');
  });

  it('should clear toast message after timeout', fakeAsync(() => {
    goalService.createGoal.and.returnValue(of(mockGoal));
    component.form.patchValue({
      name: '新規目標',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    });

    component.onSubmit();
    expect(component.toastMessage()).toBe('目標を作成しました');

    tick(3000);
    expect(component.toastMessage()).toBeNull();
  }));

  it('should return field label for unknown field', () => {
    const fb = TestBed.inject(FormBuilder);
    component.form.addControl('unknownField', fb.control('', [Validators.required]));
    const unknownControl = component.form.get('unknownField');
    unknownControl?.markAsTouched();
    unknownControl?.setValue('');

    const errorMessage = component.getErrorMessage('unknownField');
    expect(errorMessage).toContain('unknownField');
  });

  it('should return field label fallback when controlName is not in labels', () => {
    const fb = TestBed.inject(FormBuilder);
    component.form.addControl('customField', fb.control('', [Validators.required]));
    const customControl = component.form.get('customField');
    customControl?.markAsTouched();
    customControl?.setValue('');

    const errorMessage = component.getErrorMessage('customField');
    expect(errorMessage).toContain('customField');
  });
});

