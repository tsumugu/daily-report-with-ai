import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { WeeklyFocusesDatabase } from '../db/weekly-focuses.db.js';
import { GoodPointsDatabase, ImprovementsDatabase, DailyReportsDatabase } from '../db/daily-reports.db.js';
import { DailyReportGoalsDatabase } from '../db/daily-report-goals.db.js';
import { GoalsDatabase } from '../db/goals.db.js';
import { FollowupsDatabase } from '../db/followups.db.js';
import { UsersDatabase } from '../db/users.db.js';
import { initializeTables } from '../db/database.js';
import { generateToken } from '../middleware/auth.middleware.js';

// モジュールをモック（実際のインスタンスを返すようにする）
const mockDbInstances = {
  weeklyFocusesDb: null as WeeklyFocusesDatabase | null,
  goodPointsDb: null as GoodPointsDatabase | null,
  improvementsDb: null as ImprovementsDatabase | null,
  dailyReportsDb: null as DailyReportsDatabase | null,
  dailyReportGoalsDb: null as DailyReportGoalsDatabase | null,
  goalsDb: null as GoalsDatabase | null,
  followupsDb: null as FollowupsDatabase | null,
  usersDb: null as UsersDatabase | null,
};

vi.mock('../db/weekly-focuses.db.js', async () => {
  const actual = await vi.importActual('../db/weekly-focuses.db.js');
  return {
    ...actual,
    getWeeklyFocusesDatabase: async () => {
      return mockDbInstances.weeklyFocusesDb || (actual as any).weeklyFocusesDb;
    },
  };
});

vi.mock('../db/daily-reports.db.js', async () => {
  const actual = await vi.importActual('../db/daily-reports.db.js');
  return {
    ...actual,
    getGoodPointsDatabase: async () => {
      return mockDbInstances.goodPointsDb || (actual as any).goodPointsDb;
    },
    getImprovementsDatabase: async () => {
      return mockDbInstances.improvementsDb || (actual as any).improvementsDb;
    },
    getDailyReportsDatabase: async () => {
      return mockDbInstances.dailyReportsDb || (actual as any).dailyReportsDb;
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

vi.mock('../db/goals.db.js', async () => {
  const actual = await vi.importActual('../db/goals.db.js');
  return {
    ...actual,
    getGoalsDatabase: async () => {
      return mockDbInstances.goalsDb || (actual as any).goalsDb;
    },
  };
});

vi.mock('../db/followups.db.js', async () => {
  const actual = await vi.importActual('../db/followups.db.js');
  return {
    ...actual,
    getFollowupsDatabase: async () => {
      return mockDbInstances.followupsDb || (actual as any).followupsDb;
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

import { weeklyFocusesRouter } from './weekly-focuses.routes.js';

describe('weeklyFocusesRouter', () => {
  let app: express.Application;
  let authToken: string;
  let db: DatabaseType;
  let weeklyFocusesDb: WeeklyFocusesDatabase;
  let goodPointsDb: GoodPointsDatabase;
  let improvementsDb: ImprovementsDatabase;
  let dailyReportsDb: DailyReportsDatabase;
  let dailyReportGoalsDb: DailyReportGoalsDatabase;
  let goalsDb: GoalsDatabase;
  let followupsDb: FollowupsDatabase;
  let usersDb: UsersDatabase;
  const testUserId = 'test-user-id';
  const testUserEmail = 'test@example.com';

  // ダミーの日報を作成するヘルパー関数
  const createDummyReport = (id = 'report-1') => {
    const dummyReport = {
      id,
      userId: testUserId,
      date: '2025-12-01',
      events: 'テストイベント',
      learnings: null,
      goodPointIds: [],
      improvementIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dailyReportsDb.save(dummyReport);
    return dummyReport.id;
  };

  beforeEach(() => {
    // インメモリデータベースを作成
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables(db);
    
    // 各データベースクラスのインスタンスを作成
    usersDb = new UsersDatabase(db);
    dailyReportsDb = new DailyReportsDatabase(db);
    goodPointsDb = new GoodPointsDatabase(db);
    improvementsDb = new ImprovementsDatabase(db);
    dailyReportGoalsDb = new DailyReportGoalsDatabase(db);
    goalsDb = new GoalsDatabase(db);
    followupsDb = new FollowupsDatabase(db);
    weeklyFocusesDb = new WeeklyFocusesDatabase(db);

    // モックインスタンスを設定
    mockDbInstances.weeklyFocusesDb = weeklyFocusesDb;
    mockDbInstances.goodPointsDb = goodPointsDb;
    mockDbInstances.improvementsDb = improvementsDb;
    mockDbInstances.dailyReportsDb = dailyReportsDb;
    mockDbInstances.dailyReportGoalsDb = dailyReportGoalsDb;
    mockDbInstances.goalsDb = goalsDb;
    mockDbInstances.followupsDb = followupsDb;
    mockDbInstances.usersDb = usersDb;

    // テスト用アプリケーション設定
    app = express();
    app.use(express.json());
    app.use('/api', weeklyFocusesRouter);

    usersDb.save({
      id: testUserId,
      email: testUserEmail,
      passwordHash: 'hashed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    authToken = generateToken(testUserId);
  });

  afterEach(() => {
    // モックインスタンスをクリア
    mockDbInstances.weeklyFocusesDb = null;
    mockDbInstances.goodPointsDb = null;
    mockDbInstances.improvementsDb = null;
    mockDbInstances.dailyReportsDb = null;
    mockDbInstances.dailyReportGoalsDb = null;
    mockDbInstances.goalsDb = null;
    mockDbInstances.followupsDb = null;
    mockDbInstances.usersDb = null;

    db.close();
  });

  describe('GET /api/weekly-focuses', () => {
    // 週の開始日（月曜日）を計算するヘルパー関数
    const getWeekStartDate = (date: Date = new Date()): string => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const year = monday.getFullYear();
      const month = String(monday.getMonth() + 1).padStart(2, '0');
      const dayOfMonth = String(monday.getDate()).padStart(2, '0');
      return `${year}-${month}-${dayOfMonth}`;
    };

    it('今週のフォーカスを取得できること', async () => {
      const reportId = createDummyReport();
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '進行中' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint, reportId);

      // 今週のフォーカスを作成
      const weekStartDate = getWeekStartDate();
      const weeklyFocus = {
        id: 'focus-1',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        weekStartDate,
        createdAt: new Date().toISOString(),
      };
      weeklyFocusesDb.save(weeklyFocus);

      const response = await request(app)
        .get('/api/weekly-focuses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/weekly-focuses', () => {
    // 週の開始日（月曜日）を計算するヘルパー関数
    const getWeekStartDate = (date: Date = new Date()): string => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const year = monday.getFullYear();
      const month = String(monday.getMonth() + 1).padStart(2, '0');
      const dayOfMonth = String(monday.getDate()).padStart(2, '0');
      return `${year}-${month}-${dayOfMonth}`;
    };

    it('週次フォーカスを設定できること', async () => {
      const reportId = createDummyReport();
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '進行中' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint, reportId);

      const response = await request(app)
        .post('/api/weekly-focuses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemType: 'goodPoint',
          itemId: 'gp-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.itemType).toBe('goodPoint');
      expect(response.body.itemId).toBe('gp-1');
      expect(response.body.weekStartDate).toBeDefined();
    });

    it('最大5件まで設定できること', async () => {
      const weekStartDate = getWeekStartDate();

      // 5件のフォーカスを作成
      for (let i = 1; i <= 5; i++) {
        const reportId = createDummyReport(`report-${i}`);
        const goodPoint = {
          id: `gp-${i}`,
          userId: testUserId,
          content: `テストよかったこと${i}`,
          factors: null,
          tags: [],
          status: '進行中' as const,
          success_count: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        goodPointsDb.save(goodPoint, reportId);

        const weeklyFocus = {
          id: `focus-${i}`,
          userId: testUserId,
          itemType: 'goodPoint' as const,
          itemId: `gp-${i}`,
          weekStartDate,
          createdAt: new Date().toISOString(),
        };
        weeklyFocusesDb.save(weeklyFocus);
      }

      // 6件目を追加しようとする
      const reportId6 = createDummyReport('report-6');
      const goodPoint6 = {
        id: 'gp-6',
        userId: testUserId,
        content: 'テストよかったこと6',
        factors: null,
        tags: [],
        status: '進行中' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint6, reportId6);

      const response = await request(app)
        .post('/api/weekly-focuses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemType: 'goodPoint',
          itemId: 'gp-6',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('5件');
    });

    it('既に同じ項目が今週のフォーカスに設定されている場合、400エラーを返すこと', async () => {
      const reportId = createDummyReport();
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '進行中' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint, reportId);

      const weekStartDate = getWeekStartDate();
      const weeklyFocus = {
        id: 'focus-1',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        weekStartDate,
        createdAt: new Date().toISOString(),
      };
      weeklyFocusesDb.save(weeklyFocus);

      const response = await request(app)
        .post('/api/weekly-focuses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemType: 'goodPoint',
          itemId: 'gp-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('既に今週のフォーカス');
    });

    it('未認証の場合、401エラーを返すこと', async () => {
      const response = await request(app).post('/api/weekly-focuses').send({
        itemType: 'goodPoint',
        itemId: 'gp-1',
      });

      expect(response.status).toBe(401);
    });

    it('存在しないよかったこと/改善点の場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/weekly-focuses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemType: 'goodPoint',
          itemId: 'not-exist',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/weekly-focuses/:id', () => {
    it('週次フォーカスを削除できること', async () => {
      const weeklyFocus = {
        id: 'focus-1',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };
      weeklyFocusesDb.save(weeklyFocus);

      const response = await request(app)
        .delete('/api/weekly-focuses/focus-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const found = weeklyFocusesDb.findById('focus-1');
      expect(found).toBeUndefined();
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .delete('/api/weekly-focuses/not-exist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});

