import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GoalListPageComponent } from './goal-list-page.component';
import { GoalService } from '../../services/goal.service';
import { GoalWithChildren } from '../../models/goal.model';
import { provideLucideIconsForTesting } from '../../../../shared/test-helpers/lucide-icons.helper';

describe('GoalListPageComponent', () => {
  let component: GoalListPageComponent;
  let fixture: ComponentFixture<GoalListPageComponent>;
  let goalService: jasmine.SpyObj<GoalService>;
  let router: jasmine.SpyObj<Router>;

  const mockGoals: GoalWithChildren[] = [
    {
      id: '1',
      userId: 'user1',
      name: 'テスト目標1',
      description: null,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      parentId: null,
      goalType: 'skill',
      successCriteria: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      children: [],
    },
  ];

  beforeEach(async () => {
    const goalServiceSpy = jasmine.createSpyObj('GoalService', ['getGoals']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [GoalListPageComponent],
      providers: [
        { provide: GoalService, useValue: goalServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideLucideIconsForTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalListPageComponent);
    component = fixture.componentInstance;
    goalService = TestBed.inject(GoalService) as jasmine.SpyObj<GoalService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load goals on init', () => {
    goalService.getGoals.and.returnValue(of({ data: mockGoals }));

    component.ngOnInit();

    expect(goalService.getGoals).toHaveBeenCalledWith(true);
    expect(component.goals()).toEqual(mockGoals);
    expect(component.isLoading()).toBe(false);
    // 初期状態でルートノードが展開されていることを確認
    expect(component.expandedIds().has('1')).toBe(true);
  });

  it('should expand all hierarchy levels on init', () => {
    const goalsWithChildren: GoalWithChildren[] = [
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
            children: [
              {
                id: '3',
                userId: 'user1',
                name: '孫目標',
                description: null,
                startDate: '2025-01-01',
                endDate: '2025-02-28',
                parentId: '2',
                goalType: null,
                successCriteria: null,
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                children: [],
              },
            ],
          },
        ],
      },
    ];
    goalService.getGoals.and.returnValue(of({ data: goalsWithChildren }));

    component.ngOnInit();

    // すべての階層が展開されていることを確認
    expect(component.expandedIds().has('1')).toBe(true);
    expect(component.expandedIds().has('2')).toBe(true);
    expect(component.expandedIds().has('3')).toBe(true);
  });

  it('should handle error when loading goals', () => {
    goalService.getGoals.and.returnValue(
      throwError(() => ({ error: { message: 'エラーが発生しました' } }))
    );

    component.ngOnInit();

    expect(component.errorMessage()).toBe('エラーが発生しました');
    expect(component.isLoading()).toBe(false);
  });

  it('should navigate to goal detail on goal click', () => {
    component.onGoalClick('1');
    expect(router.navigate).toHaveBeenCalledWith(['/goals', '1']);
  });

  it('should toggle expand state', () => {
    component.expandedIds.set(new Set());
    component.onExpandToggle('1');
    expect(component.expandedIds().has('1')).toBe(true);
    component.onExpandToggle('1');
    expect(component.expandedIds().has('1')).toBe(false);
  });

  it('should convert goals to tree nodes', () => {
    const goalsWithChildren: GoalWithChildren[] = [
      {
        id: '1',
        userId: 'user1',
        name: '親目標',
        description: '説明',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: 'skill',
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
    component.goals.set(goalsWithChildren);

    const treeNodes = component.convertToTreeNodes(goalsWithChildren);

    expect(treeNodes.length).toBe(1);
    expect(treeNodes[0].id).toBe('1');
    expect(treeNodes[0].data.title).toBe('親目標');
    expect(treeNodes[0].children.length).toBe(1);
  });

  it('should return isEmpty correctly', () => {
    component.goals.set([]);
    component.isLoading.set(false);

    expect(component.isEmpty).toBe(true);

    component.goals.set(mockGoals);
    expect(component.isEmpty).toBe(false);

    component.isLoading.set(true);
    expect(component.isEmpty).toBe(false);
  });

  it('should handle error when loading goals without message', () => {
    goalService.getGoals.and.returnValue(throwError(() => ({})));

    component.ngOnInit();

    expect(component.errorMessage()).toBe('目標の取得に失敗しました');
    expect(component.isLoading()).toBe(false);
  });

  describe('onCreateChild', () => {
    it('should navigate to new goal form with parent goal ID when clicked goal has parent', () => {
      const goalsWithChildren: GoalWithChildren[] = [
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
      component.ngOnInit();

      // 子目標（ID: '2'）のプラスボタンを押した場合、親目標ID（'1'）が設定される
      component.onCreateChild('2');

      expect(router.navigate).toHaveBeenCalledWith(['/goals/new'], {
        queryParams: { parentId: '1' },
      });
    });

    it('should navigate to new goal form without parent ID when clicked goal has no parent', () => {
      const goalsWithChildren: GoalWithChildren[] = [
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
          children: [],
        },
      ];
      goalService.getGoals.and.returnValue(of({ data: goalsWithChildren }));
      component.ngOnInit();

      // 親目標（ID: '1'）のプラスボタンを押した場合、親目標IDは設定されない
      component.onCreateChild('1');

      expect(router.navigate).toHaveBeenCalledWith(['/goals/new']);
    });

    it('should navigate to new goal form without parent ID when clicked goal is not found', () => {
      goalService.getGoals.and.returnValue(of({ data: mockGoals }));
      component.ngOnInit();

      // 存在しない目標IDの場合
      component.onCreateChild('999');

      expect(router.navigate).toHaveBeenCalledWith(['/goals/new']);
    });
  });

  describe('getGoalLevel and calculateDepth', () => {
    it('should return "long" for depth 1 goal', () => {
      const goal: GoalWithChildren = {
        id: '1',
        userId: 'user1',
        name: '長期目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        children: [],
      };
      goalService.getGoals.and.returnValue(of({ data: [goal] }));
      component.ngOnInit();
      fixture.detectChanges();

      // getGoalLevel()はprivateなので、convertToTreeNodes()を通じて間接的にテスト
      const treeNodes = component['convertToTreeNodes']([goal]);
      expect(treeNodes[0].data.levelName).toBe('長期目標');
    });

    it('should return "medium" for depth 2 goal', () => {
      const parentGoal: GoalWithChildren = {
        id: '1',
        userId: 'user1',
        name: '長期目標',
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
            name: '中期目標',
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
      };
      goalService.getGoals.and.returnValue(of({ data: [parentGoal] }));
      component.ngOnInit();
      fixture.detectChanges();

      const treeNodes = component['convertToTreeNodes']([parentGoal]);
      expect(treeNodes[0].children[0].data.levelName).toBe('中期目標');
    });

    it('should return "short" for depth 3 goal', () => {
      const parentGoal: GoalWithChildren = {
        id: '1',
        userId: 'user1',
        name: '長期目標',
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
            name: '中期目標',
            description: null,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            parentId: '1',
            goalType: null,
            successCriteria: null,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            children: [
              {
                id: '3',
                userId: 'user1',
                name: '短期目標',
                description: null,
                startDate: '2025-01-01',
                endDate: '2025-01-07',
                parentId: '2',
                goalType: null,
                successCriteria: null,
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
                children: [],
              },
            ],
          },
        ],
      };
      goalService.getGoals.and.returnValue(of({ data: [parentGoal] }));
      component.ngOnInit();
      fixture.detectChanges();

      const treeNodes = component['convertToTreeNodes']([parentGoal]);
      expect(treeNodes[0].children[0].children[0].data.levelName).toBe('短期目標');
    });

    it('should return 1 when parent is not found in calculateDepth', () => {
      const goal: GoalWithChildren = {
        id: '2',
        userId: 'user1',
        name: '目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        parentId: '999', // 存在しない親ID
        goalType: null,
        successCriteria: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        children: [],
      };
      goalService.getGoals.and.returnValue(of({ data: [goal] }));
      component.ngOnInit();
      fixture.detectChanges();

      // calculateDepth()はprivateなので、convertToTreeNodes()を通じて間接的にテスト
      // 親が見つからない場合、depthは1になる
      const treeNodes = component['convertToTreeNodes']([goal]);
      expect(treeNodes[0].data.levelName).toBe('長期目標'); // 親が見つからない場合、depthは1なのでlong
    });
  });

});

