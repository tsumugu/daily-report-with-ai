import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { DailyReportGoalsDatabase } from './daily-report-goals.db.js';
import { UsersDatabase } from './users.db.js';
import { DailyReportsDatabase } from './daily-reports.db.js';
import { GoalsDatabase } from './goals.db.js';
import { initializeTables } from './database.js';

describe('DailyReportGoalsDatabase', () => {
  let db: DatabaseType;
  let dailyReportGoalsDb: DailyReportGoalsDatabase;
  let usersDb: UsersDatabase;
  let dailyReportsDb: DailyReportsDatabase;
  let goalsDb: GoalsDatabase;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables(db);
    usersDb = new UsersDatabase(db);
    dailyReportsDb = new DailyReportsDatabase(db);
    goalsDb = new GoalsDatabase(db);
    dailyReportGoalsDb = new DailyReportGoalsDatabase(db);

    // テスト用ユーザーを作成
    usersDb.save({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    db.close();
  });

  describe('save', () => {
    it('日報と目標の関連付けを保存できること', () => {
      // テスト用の日報と目標を作成
      dailyReportsDb.save({
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-1',
        userId: 'user-1',
        name: 'テスト目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const dailyReportGoal = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };

      dailyReportGoalsDb.save(dailyReportGoal);
      const found = dailyReportGoalsDb.findById('drg-1');

      expect(found).toEqual(dailyReportGoal);
    });
  });

  describe('findById', () => {
    it('存在するIDの場合、関連付けを返すこと', () => {
      // テスト用の日報と目標を作成
      dailyReportsDb.save({
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-1',
        userId: 'user-1',
        name: 'テスト目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const dailyReportGoal = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };

      dailyReportGoalsDb.save(dailyReportGoal);
      const found = dailyReportGoalsDb.findById('drg-1');

      expect(found).toEqual(dailyReportGoal);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = dailyReportGoalsDb.findById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('findByDailyReportId', () => {
    it('指定した日報IDに関連付けられた目標を返すこと', () => {
      // テスト用の日報と目標を作成
      dailyReportsDb.save({
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      dailyReportsDb.save({
        id: 'report-2',
        userId: 'user-1',
        date: '2025-12-06',
        events: 'テストイベント2',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-1',
        userId: 'user-1',
        name: 'テスト目標1',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-2',
        userId: 'user-1',
        name: 'テスト目標2',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-3',
        userId: 'user-1',
        name: 'テスト目標3',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const drg1 = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };
      const drg2 = {
        id: 'drg-2',
        dailyReportId: 'report-1',
        goalId: 'goal-2',
        createdAt: new Date().toISOString(),
      };
      const drg3 = {
        id: 'drg-3',
        dailyReportId: 'report-2',
        goalId: 'goal-3',
        createdAt: new Date().toISOString(),
      };

      dailyReportGoalsDb.save(drg1);
      dailyReportGoalsDb.save(drg2);
      dailyReportGoalsDb.save(drg3);

      const found = dailyReportGoalsDb.findByDailyReportId('report-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(drg1);
      expect(found).toContainEqual(drg2);
    });

    it('関連付けがない場合、空配列を返すこと', () => {
      const found = dailyReportGoalsDb.findByDailyReportId('report-1');
      expect(found).toEqual([]);
    });
  });

  describe('findByDailyReportIds', () => {
    it('複数の日報IDに関連付けられた目標をMapで返すこと（N+1対策）', () => {
      // テスト用の日報と目標を作成
      dailyReportsDb.save({
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      dailyReportsDb.save({
        id: 'report-2',
        userId: 'user-1',
        date: '2025-12-06',
        events: 'テストイベント2',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-1',
        userId: 'user-1',
        name: 'テスト目標1',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-2',
        userId: 'user-1',
        name: 'テスト目標2',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-3',
        userId: 'user-1',
        name: 'テスト目標3',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const drg1 = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };
      const drg2 = {
        id: 'drg-2',
        dailyReportId: 'report-1',
        goalId: 'goal-2',
        createdAt: new Date().toISOString(),
      };
      const drg3 = {
        id: 'drg-3',
        dailyReportId: 'report-2',
        goalId: 'goal-3',
        createdAt: new Date().toISOString(),
      };

      dailyReportGoalsDb.save(drg1);
      dailyReportGoalsDb.save(drg2);
      dailyReportGoalsDb.save(drg3);

      const found = dailyReportGoalsDb.findByDailyReportIds(['report-1', 'report-2', 'report-3']);

      expect(found.size).toBe(2);
      expect(found.get('report-1')).toHaveLength(2);
      expect(found.get('report-1')).toContainEqual(drg1);
      expect(found.get('report-1')).toContainEqual(drg2);
      expect(found.get('report-2')).toHaveLength(1);
      expect(found.get('report-2')).toContainEqual(drg3);
      expect(found.has('report-3')).toBe(false);
    });

    it('空配列を渡した場合、空のMapを返すこと', () => {
      const found = dailyReportGoalsDb.findByDailyReportIds([]);
      expect(found.size).toBe(0);
    });
  });

  describe('findByGoalId', () => {
    it('指定した目標IDに関連付けられた日報を返すこと', () => {
      // テスト用の日報と目標を作成
      dailyReportsDb.save({
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      dailyReportsDb.save({
        id: 'report-2',
        userId: 'user-1',
        date: '2025-12-06',
        events: 'テストイベント2',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      dailyReportsDb.save({
        id: 'report-3',
        userId: 'user-1',
        date: '2025-12-07',
        events: 'テストイベント3',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-1',
        userId: 'user-1',
        name: 'テスト目標1',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-2',
        userId: 'user-1',
        name: 'テスト目標2',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const drg1 = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };
      const drg2 = {
        id: 'drg-2',
        dailyReportId: 'report-2',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };
      const drg3 = {
        id: 'drg-3',
        dailyReportId: 'report-3',
        goalId: 'goal-2',
        createdAt: new Date().toISOString(),
      };

      dailyReportGoalsDb.save(drg1);
      dailyReportGoalsDb.save(drg2);
      dailyReportGoalsDb.save(drg3);

      const found = dailyReportGoalsDb.findByGoalId('goal-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(drg1);
      expect(found).toContainEqual(drg2);
    });

    it('関連付けがない場合、空配列を返すこと', () => {
      const found = dailyReportGoalsDb.findByGoalId('goal-1');
      expect(found).toEqual([]);
    });
  });

  describe('deleteByDailyReportId', () => {
    it('指定した日報IDの関連付けをすべて削除すること（カスケード削除）', () => {
      // テスト用の日報と目標を作成
      dailyReportsDb.save({
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      dailyReportsDb.save({
        id: 'report-2',
        userId: 'user-1',
        date: '2025-12-06',
        events: 'テストイベント2',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-1',
        userId: 'user-1',
        name: 'テスト目標1',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-2',
        userId: 'user-1',
        name: 'テスト目標2',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-3',
        userId: 'user-1',
        name: 'テスト目標3',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const drg1 = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };
      const drg2 = {
        id: 'drg-2',
        dailyReportId: 'report-1',
        goalId: 'goal-2',
        createdAt: new Date().toISOString(),
      };
      const drg3 = {
        id: 'drg-3',
        dailyReportId: 'report-2',
        goalId: 'goal-3',
        createdAt: new Date().toISOString(),
      };

      dailyReportGoalsDb.save(drg1);
      dailyReportGoalsDb.save(drg2);
      dailyReportGoalsDb.save(drg3);

      dailyReportGoalsDb.deleteByDailyReportId('report-1');

      const found1 = dailyReportGoalsDb.findByDailyReportId('report-1');
      const found2 = dailyReportGoalsDb.findByDailyReportId('report-2');

      expect(found1).toHaveLength(0);
      expect(found2).toHaveLength(1);
      expect(found2).toContainEqual(drg3);
    });

    it('存在しない日報IDを指定しても、エラーにならないこと', () => {
      expect(() => dailyReportGoalsDb.deleteByDailyReportId('non-existent')).not.toThrow();
    });
  });

  describe('delete', () => {
    it('指定したIDの関連付けを削除すること', () => {
      // テスト用の日報と目標を作成
      dailyReportsDb.save({
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-1',
        userId: 'user-1',
        name: 'テスト目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const dailyReportGoal = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };

      dailyReportGoalsDb.save(dailyReportGoal);
      dailyReportGoalsDb.delete('drg-1');

      const found = dailyReportGoalsDb.findById('drg-1');
      expect(found).toBeUndefined();
    });

    it('存在しないIDを指定しても、エラーにならないこと', () => {
      expect(() => dailyReportGoalsDb.delete('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('すべての関連付けを削除すること', () => {
      // テスト用の日報と目標を作成
      dailyReportsDb.save({
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      dailyReportsDb.save({
        id: 'report-2',
        userId: 'user-1',
        date: '2025-12-06',
        events: 'テストイベント2',
        learnings: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-1',
        userId: 'user-1',
        name: 'テスト目標1',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      goalsDb.save({
        id: 'goal-2',
        userId: 'user-1',
        name: 'テスト目標2',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const drg1 = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };
      const drg2 = {
        id: 'drg-2',
        dailyReportId: 'report-2',
        goalId: 'goal-2',
        createdAt: new Date().toISOString(),
      };

      dailyReportGoalsDb.save(drg1);
      dailyReportGoalsDb.save(drg2);
      dailyReportGoalsDb.clear();

      const found1 = dailyReportGoalsDb.findById('drg-1');
      const found2 = dailyReportGoalsDb.findById('drg-2');

      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();
    });
  });
});
