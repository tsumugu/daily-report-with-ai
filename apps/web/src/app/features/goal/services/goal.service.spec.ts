import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GoalService } from './goal.service';
import { Goal, GoalWithChildren, GoalDetailResponse, CreateGoalRequest, UpdateGoalRequest } from '../models/goal.model';

describe('GoalService', () => {
  let service: GoalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(GoalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get goals with hierarchy', () => {
    const mockGoals: GoalWithChildren[] = [
      {
        id: '1',
        userId: 'user1',
        name: 'テスト目標',
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

    service.getGoals(true).subscribe((response) => {
      expect(response.data).toEqual(mockGoals);
    });

    const req = httpMock.expectOne('/api/goals?hierarchy=true');
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockGoals });
  });

  it('should get goals without hierarchy', () => {
    const mockGoals: Goal[] = [
      {
        id: '1',
        userId: 'user1',
        name: 'テスト目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: 'skill',
        successCriteria: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];

    service.getGoals(false).subscribe((response) => {
      expect(response.data).toEqual(mockGoals);
    });

    const req = httpMock.expectOne('/api/goals?hierarchy=false');
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockGoals });
  });

  it('should get goals with default hierarchy parameter', () => {
    const mockGoals: GoalWithChildren[] = [
      {
        id: '1',
        userId: 'user1',
        name: 'テスト目標',
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

    service.getGoals().subscribe((response) => {
      expect(response.data).toEqual(mockGoals);
    });

    const req = httpMock.expectOne('/api/goals?hierarchy=true');
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockGoals });
  });

  it('should get goal detail', () => {
    const mockGoal: GoalDetailResponse = {
      id: '1',
      userId: 'user1',
      name: 'テスト目標',
      description: null,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      parentId: null,
      goalType: 'skill',
      successCriteria: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      parent: null,
      children: [],
    };

    service.getGoal('1').subscribe((goal) => {
      expect(goal).toEqual(mockGoal);
    });

    const req = httpMock.expectOne('/api/goals/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockGoal);
  });

  it('should create goal', () => {
    const request: CreateGoalRequest = {
      name: 'テスト目標',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    };

    const mockGoal: Goal = {
      id: '1',
      userId: 'user1',
      name: 'テスト目標',
      description: null,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      parentId: null,
      goalType: null,
      successCriteria: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    service.createGoal(request).subscribe((goal) => {
      expect(goal).toEqual(mockGoal);
    });

    const req = httpMock.expectOne('/api/goals');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockGoal);
  });

  it('should update goal', () => {
    const request: UpdateGoalRequest = {
      name: '更新後の目標',
    };

    const mockGoal: Goal = {
      id: '1',
      userId: 'user1',
      name: '更新後の目標',
      description: null,
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      parentId: null,
      goalType: null,
      successCriteria: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    service.updateGoal('1', request).subscribe((goal) => {
      expect(goal).toEqual(mockGoal);
    });

    const req = httpMock.expectOne('/api/goals/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockGoal);
  });

  it('should delete goal', () => {
    service.deleteGoal('1').subscribe((response) => {
      expect(response.message).toBe('目標を削除しました');
    });

    const req = httpMock.expectOne('/api/goals/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '目標を削除しました' });
  });
});

