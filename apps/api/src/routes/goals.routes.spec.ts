import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { GoalsDatabase } from '../db/goals.db.js';
import { UsersDatabase } from '../db/users.db.js';
import { WeeklyFocusesDatabase } from '../db/weekly-focuses.db.js';
import { DailyReportGoalsDatabase } from '../db/daily-report-goals.db.js';
import { DailyReportsDatabase } from '../db/daily-reports.db.js';
import { initializeTables } from '../db/database.js';
import { generateToken } from '../middleware/auth.middleware.js';
import { Goal } from '../models/daily-report.model.js';

// モジュールをモック（実際のインスタンスを返すようにする）
const mockDbInstances = {
  goalsDb: null as GoalsDatabase | null,
  usersDb: null as UsersDatabase | null,
  weeklyFocusesDb: null as any | null,
  dailyReportGoalsDb: null as any | null,
  dailyReportsDb: null as any | null,
};

vi.mock('../db/goals.db.js', async () => {
  const actual = await vi.importActual('../db/goals.db.js');
  return {
    ...actual,
    getGoalsDatabase: async () => {
      return mockDbInstances.goalsDb || (actual as any).goalsDb;
    },
  };
});

vi.mock('../db/users.db.js', async () => {
  const actual = await vi.importActual('../db/users.db.js');
  return {
    ...actual,
    getUsersDatabase: async () => {
      return mockDbInstances.usersDb || (actual as any).usersDb;
    },
  };
});

vi.mock('../db/weekly-focuses.db.js', async () => {
  const actual = await vi.importActual('../db/weekly-focuses.db.js');
  return {
    ...actual,
    getWeeklyFocusesDatabase: async () => {
      return mockDbInstances.weeklyFocusesDb || (actual as any).weeklyFocusesDb;
    },
  };
});

vi.mock('../db/daily-report-goals.db.js', async () => {
  const actual = await vi.importActual('../db/daily-report-goals.db.js');
  return {
    ...actual,
    getDailyReportGoalsDatabase: async () => {
      return mockDbInstances.dailyReportGoalsDb || (actual as any).dailyReportGoalsDb;
    },
  };
});

vi.mock('../db/daily-reports.db.js', async () => {
  const actual = await vi.importActual('../db/daily-reports.db.js');
  return {
    ...actual,
    getDailyReportsDatabase: async () => {
      return mockDbInstances.dailyReportsDb || (actual as any).dailyReportsDb;
    },
  };
});

import { goalsRouter } from './goals.routes.js';

describe('goalsRouter', () => {
  let app: express.Application;
  let authToken: string;
  let db: DatabaseType;
  let goalsDb: GoalsDatabase;
  let usersDb: UsersDatabase;
  const testUserId = 'test-user-id';
  const testUserEmail = 'test@example.com';

  beforeEach(() => {
    // インメモリデータベースを作成
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables(db);
    
    // 各データベースクラスのインスタンスを作成
    usersDb = new UsersDatabase(db);
    goalsDb = new GoalsDatabase(db);
    const weeklyFocusesDb = new WeeklyFocusesDatabase(db);
    const dailyReportGoalsDb = new DailyReportGoalsDatabase(db);
    const dailyReportsDb = new DailyReportsDatabase(db);

    // モックインスタンスを設定
    mockDbInstances.goalsDb = goalsDb;
    mockDbInstances.usersDb = usersDb;
    mockDbInstances.weeklyFocusesDb = weeklyFocusesDb;
    mockDbInstances.dailyReportGoalsDb = dailyReportGoalsDb;
    mockDbInstances.dailyReportsDb = dailyReportsDb;

    // テスト用アプリケーション設定
    app = express();
    app.use(express.json());
    app.use('/api', goalsRouter);

    // テストユーザー作成
    usersDb.save({
      id: testUserId,
      email: testUserEmail,
      passwordHash: 'hashed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 認証トークン生成
    authToken = generateToken(testUserId);
  });

  afterEach(() => {
    // モックインスタンスをクリア
    mockDbInstances.goalsDb = null;
    mockDbInstances.usersDb = null;
    mockDbInstances.weeklyFocusesDb = null;
    mockDbInstances.dailyReportGoalsDb = null;
    mockDbInstances.dailyReportsDb = null;
    db.close();
  });

  describe('POST /api/goals', () => {
    it('認証済みユーザーが目標を作成できること', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'テスト目標',
          description: 'テスト説明',
          startDate: '2025-01-01',
          endDate: '2025-06-30',
          parentId: null,
          goalType: 'skill',
          successCriteria: 'テスト達成基準',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('テスト目標');
      expect(response.body.userId).toBe(testUserId);
    });

    it('必須フィールドが不足している場合、400エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'テスト説明',
          startDate: '2025-01-01',
          endDate: '2025-06-30',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('name は必須です');
    });

    it('endDateがstartDateより前の場合、400エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'テスト目標',
          startDate: '2025-06-30',
          endDate: '2025-01-01',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('endDate は startDate 以降である必要があります');
    });

    it('親目標が存在しない場合、400エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'テスト目標',
          startDate: '2025-01-01',
          endDate: '2025-06-30',
          parentId: 'non-existent-parent',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('親目標が見つかりません');
    });

    it('下位目標の期間が上位目標の期間内に収まらない場合、400エラーを返すこと', async () => {
      // 親目標を作成
      const parentGoal: Goal = {
        id: 'parent-goal-id',
        userId: testUserId,
        name: '親目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(parentGoal);

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'テスト目標',
          startDate: '2025-01-01',
          endDate: '2025-06-30',
          parentId: 'parent-goal-id',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('下位目標の期間は上位目標の期間内に収まる必要があります');
    });

    it('未認証ユーザーは目標を作成できないこと', async () => {
      const response = await request(app)
        .post('/api/goals')
        .send({
          name: 'テスト目標',
          startDate: '2025-01-01',
          endDate: '2025-06-30',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/goals', () => {
    it('認証済みユーザーが目標一覧を取得できること', async () => {
      // テストデータを作成
      const goal1: Goal = {
        id: 'goal-1',
        userId: testUserId,
        name: '目標1',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(goal1);

      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('目標1');
    });

    it('階層構造を含めて取得できること', async () => {
      // 親目標を作成
      const parentGoal: Goal = {
        id: 'parent-goal-id',
        userId: testUserId,
        name: '親目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(parentGoal);

      // 子目標を作成
      const childGoal: Goal = {
        id: 'child-goal-id',
        userId: testUserId,
        name: '子目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        parentId: 'parent-goal-id',
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(childGoal);

      const response = await request(app)
        .get('/api/goals?hierarchy=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('parent-goal-id');
      expect(response.body.data[0].children).toHaveLength(1);
      expect(response.body.data[0].children[0].id).toBe('child-goal-id');
    });

    it('未認証ユーザーは目標一覧を取得できないこと', async () => {
      const response = await request(app)
        .get('/api/goals');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/goals/:id', () => {
    it('認証済みユーザーが目標詳細を取得できること', async () => {
      const goal: Goal = {
        id: 'goal-1',
        userId: testUserId,
        name: 'テスト目標',
        description: 'テスト説明',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: 'skill',
        successCriteria: 'テスト達成基準',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(goal);

      const response = await request(app)
        .get('/api/goals/goal-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('goal-1');
      expect(response.body.name).toBe('テスト目標');
    });

    it('存在しない目標の場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .get('/api/goals/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('目標が見つかりません');
    });

    it('他のユーザーの目標にアクセスできないこと', async () => {
      const otherUserId = 'other-user-id';
      // 他のユーザーを作成
      usersDb.save({
        id: otherUserId,
        email: 'other@example.com',
        passwordHash: 'hashed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const goal: Goal = {
        id: 'goal-1',
        userId: otherUserId,
        name: 'テスト目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(goal);

      const response = await request(app)
        .get('/api/goals/goal-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('アクセス権限がありません');
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('認証済みユーザーが目標を更新できること', async () => {
      const goal: Goal = {
        id: 'goal-1',
        userId: testUserId,
        name: 'テスト目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(goal);

      const response = await request(app)
        .put('/api/goals/goal-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '更新された目標',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('更新された目標');
    });

    it('存在しない目標の場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .put('/api/goals/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '更新された目標',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('認証済みユーザーが目標を削除できること', async () => {
      const goal: Goal = {
        id: 'goal-1',
        userId: testUserId,
        name: 'テスト目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(goal);

      const response = await request(app)
        .delete('/api/goals/goal-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('目標を削除しました');

      // 削除されたことを確認
      const found = goalsDb.findById('goal-1');
      expect(found).toBeUndefined();
    });

    it('下位目標が存在する場合、削除できないこと', async () => {
      // 親目標を作成
      const parentGoal: Goal = {
        id: 'parent-goal-id',
        userId: testUserId,
        name: '親目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(parentGoal);

      // 子目標を作成
      const childGoal: Goal = {
        id: 'child-goal-id',
        userId: testUserId,
        name: '子目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        parentId: 'parent-goal-id',
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goalsDb.save(childGoal);

      const response = await request(app)
        .delete('/api/goals/parent-goal-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('下位目標が存在するため、削除できません');
    });
  });
});
