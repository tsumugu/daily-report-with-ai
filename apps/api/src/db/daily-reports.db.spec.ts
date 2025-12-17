import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import {
  DailyReportsDatabase,
  GoodPointsDatabase,
  ImprovementsDatabase,
} from './daily-reports.db.js';
import { UsersDatabase } from './users.db.js';
import { initializeTables } from './database.js';

describe('DailyReportsDatabase', () => {
  let db: DatabaseType;
  let dailyReportsDb: DailyReportsDatabase;
  let goodPointsDb: GoodPointsDatabase;
  let improvementsDb: ImprovementsDatabase;
  let usersDb: UsersDatabase;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables(db);
    usersDb = new UsersDatabase(db);
    dailyReportsDb = new DailyReportsDatabase(db);
    goodPointsDb = new GoodPointsDatabase(db);
    improvementsDb = new ImprovementsDatabase(db);

    // テスト用ユーザーを作成
    usersDb.save({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    usersDb.save({
      id: 'user-2',
      email: 'test2@example.com',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    db.close();
  });

  describe('save', () => {
    it('日報を保存できること', () => {
      // まず日報を作成
      const report = {
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: 'テスト学び',
        goodPointIds: [],
        improvementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dailyReportsDb.save(report);

      // その後、good_pointsとimprovementsを作成
      const goodPoint = {
        id: 'gp-1',
        userId: 'user-1',
        content: 'テスト内容',
        factors: null,
        tags: [],
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint, 'report-1');

      const improvement = {
        id: 'imp-1',
        userId: 'user-1',
        content: 'テスト内容',
        action: null,
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      improvementsDb.save(improvement, 'report-1');

      // 日報を再取得してgoodPointIdsとimprovementIdsが含まれていることを確認
      const found = dailyReportsDb.findById('report-1');
      expect(found).toBeDefined();
      expect(found?.goodPointIds).toContain('gp-1');
      expect(found?.improvementIds).toContain('imp-1');
    });
  });

  describe('findById', () => {
    it('存在するIDの場合、日報を返すこと', () => {
      const report = {
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        goodPointIds: [],
        improvementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dailyReportsDb.save(report);
      const found = dailyReportsDb.findById('report-1');

      expect(found).toEqual(report);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = dailyReportsDb.findById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('findByUserIdAndDate', () => {
    it('ユーザーIDと日付で日報を検索できること', () => {
      const report = {
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        goodPointIds: [],
        improvementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dailyReportsDb.save(report);
      const found = dailyReportsDb.findByUserIdAndDate('user-1', '2025-12-05');

      expect(found).toEqual(report);
    });

    it('該当なしの場合、undefinedを返すこと', () => {
      const found = dailyReportsDb.findByUserIdAndDate('user-1', '2025-12-06');
      expect(found).toBeUndefined();
    });
  });

  describe('findAllByUserId', () => {
    it('ユーザーIDで全日報を取得できること', () => {
      const report1 = {
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'イベント1',
        learnings: null,
        goodPointIds: [],
        improvementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const report2 = {
        id: 'report-2',
        userId: 'user-1',
        date: '2025-12-04',
        events: 'イベント2',
        learnings: null,
        goodPointIds: [],
        improvementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const report3 = {
        id: 'report-3',
        userId: 'user-2',
        date: '2025-12-05',
        events: 'イベント3',
        learnings: null,
        goodPointIds: [],
        improvementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dailyReportsDb.save(report1);
      dailyReportsDb.save(report2);
      dailyReportsDb.save(report3);

      const reports = dailyReportsDb.findAllByUserId('user-1');

      expect(reports).toHaveLength(2);
      expect(reports).toContainEqual(report1);
      expect(reports).toContainEqual(report2);
    });
  });

  describe('update', () => {
    it('日報を更新できること', () => {
      const report = {
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: '元のイベント',
        learnings: null,
        goodPointIds: [],
        improvementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dailyReportsDb.save(report);

      const updated = {
        ...report,
        events: '更新後のイベント',
        updatedAt: new Date().toISOString(),
      };

      dailyReportsDb.update(updated);
      const found = dailyReportsDb.findById('report-1');

      expect(found?.events).toBe('更新後のイベント');
    });
  });

  describe('clear', () => {
    it('全データを削除できること', () => {
      dailyReportsDb.save({
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テスト',
        learnings: null,
        goodPointIds: [],
        improvementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      dailyReportsDb.clear();
      const found = dailyReportsDb.findById('report-1');

      expect(found).toBeUndefined();
    });
  });
});

describe('GoodPointsDatabase', () => {
  let db: DatabaseType;
  let goodPointsDb: GoodPointsDatabase;
  let usersDb: UsersDatabase;
  let dailyReportsDb: DailyReportsDatabase;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables(db);
    usersDb = new UsersDatabase(db);
    dailyReportsDb = new DailyReportsDatabase(db);
    goodPointsDb = new GoodPointsDatabase(db);

    // テスト用ユーザーを作成
    usersDb.save({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // テスト用日報を作成
    dailyReportsDb.save({
      id: 'report-1',
      userId: 'user-1',
      date: '2025-12-05',
      events: 'テスト',
      learnings: null,
      goodPointIds: [],
      improvementIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    db.close();
  });

  describe('save', () => {
    it('よかったことを保存できること', () => {
      const goodPoint = {
        id: 'gp-1',
        userId: 'user-1',
        content: 'テスト内容',
        factors: 'テスト要因',
        tags: ['タグ1', 'タグ2'],
        status: '未対応' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      goodPointsDb.save(goodPoint, 'report-1');
      const found = goodPointsDb.findById('gp-1');

      expect(found).toEqual(goodPoint);
    });
  });

  describe('findByIds', () => {
    it('複数IDでよかったことを取得できること', () => {
      const gp1 = {
        id: 'gp-1',
        userId: 'user-1',
        content: '内容1',
        factors: null,
        tags: [],
        status: '未対応' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const gp2 = {
        id: 'gp-2',
        userId: 'user-1',
        content: '内容2',
        factors: null,
        tags: [],
        status: '未対応' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      goodPointsDb.save(gp1, 'report-1');
      goodPointsDb.save(gp2, 'report-1');

      const found = goodPointsDb.findByIds(['gp-1', 'gp-2']);

      expect(found).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('よかったことを更新できること', () => {
      const goodPoint = {
        id: 'gp-1',
        userId: 'user-1',
        content: '元の内容',
        factors: null,
        tags: [],
        status: '未対応' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      goodPointsDb.save(goodPoint, 'report-1');

      const updated = {
        ...goodPoint,
        status: '再現成功' as const,
        updatedAt: new Date().toISOString(),
      };

      goodPointsDb.update(updated, 'report-1');
      const found = goodPointsDb.findById('gp-1');

      expect(found?.status).toBe('再現成功');
    });
  });

  describe('delete', () => {
    it('指定したIDのよかったことを削除すること', () => {
      const goodPoint = {
        id: 'gp-1',
        userId: 'user-1',
        content: 'テスト内容',
        factors: null,
        tags: [],
        status: '未対応' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      goodPointsDb.save(goodPoint, 'report-1');
      goodPointsDb.delete('gp-1');

      const found = goodPointsDb.findById('gp-1');
      expect(found).toBeUndefined();
    });

    it('存在しないIDを削除してもエラーにならないこと', () => {
      expect(() => goodPointsDb.delete('not-exist')).not.toThrow();
    });
  });
});

describe('ImprovementsDatabase', () => {
  let db: DatabaseType;
  let improvementsDb: ImprovementsDatabase;
  let usersDb: UsersDatabase;
  let dailyReportsDb: DailyReportsDatabase;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables(db);
    usersDb = new UsersDatabase(db);
    dailyReportsDb = new DailyReportsDatabase(db);
    improvementsDb = new ImprovementsDatabase(db);

    // テスト用ユーザーを作成
    usersDb.save({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // テスト用日報を作成
    dailyReportsDb.save({
      id: 'report-1',
      userId: 'user-1',
      date: '2025-12-05',
      events: 'テスト',
      learnings: null,
      goodPointIds: [],
      improvementIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    db.close();
  });

  describe('save', () => {
    it('改善点を保存できること', () => {
      const improvement = {
        id: 'imp-1',
        userId: 'user-1',
        content: 'テスト内容',
        action: 'テストアクション',
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      improvementsDb.save(improvement, 'report-1');
      const found = improvementsDb.findById('imp-1');

      expect(found).toEqual(improvement);
    });
  });

  describe('findByIds', () => {
    it('複数IDで改善点を取得できること', () => {
      const imp1 = {
        id: 'imp-1',
        userId: 'user-1',
        content: '内容1',
        action: null,
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const imp2 = {
        id: 'imp-2',
        userId: 'user-1',
        content: '内容2',
        action: null,
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      improvementsDb.save(imp1, 'report-1');
      improvementsDb.save(imp2, 'report-1');

      const found = improvementsDb.findByIds(['imp-1', 'imp-2']);

      expect(found).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('改善点を更新できること', () => {
      const improvement = {
        id: 'imp-1',
        userId: 'user-1',
        content: '元の内容',
        action: null,
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      improvementsDb.save(improvement, 'report-1');

      const updated = {
        ...improvement,
        status: '完了' as const,
        updatedAt: new Date().toISOString(),
      };

      improvementsDb.update(updated, 'report-1');
      const found = improvementsDb.findById('imp-1');

      expect(found?.status).toBe('完了');
    });
  });

  describe('delete', () => {
    it('指定したIDの改善点を削除すること', () => {
      const improvement = {
        id: 'imp-1',
        userId: 'user-1',
        content: 'テスト内容',
        action: null,
        status: '未着手' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      improvementsDb.save(improvement, 'report-1');
      improvementsDb.delete('imp-1');

      const found = improvementsDb.findById('imp-1');
      expect(found).toBeUndefined();
    });

    it('存在しないIDを削除してもエラーにならないこと', () => {
      expect(() => improvementsDb.delete('not-exist')).not.toThrow();
    });
  });
});

