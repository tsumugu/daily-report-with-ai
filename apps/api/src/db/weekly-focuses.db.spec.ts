import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { WeeklyFocusesDatabase } from './weekly-focuses.db.js';
import { UsersDatabase } from './users.db.js';
import { WeeklyFocus } from '../models/daily-report.model.js';
import { initializeTables } from './database.js';

describe('WeeklyFocusesDatabase', () => {
  let db: DatabaseType;
  let weeklyFocusesDb: WeeklyFocusesDatabase;
  let usersDb: UsersDatabase;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables(db);
    usersDb = new UsersDatabase(db);
    weeklyFocusesDb = new WeeklyFocusesDatabase(db);

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
    it('週次フォーカスを保存できること', () => {
      const weeklyFocus: WeeklyFocus = {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      weeklyFocusesDb.save(weeklyFocus);
      const found = weeklyFocusesDb.findById('focus-1');

      expect(found).toEqual(weeklyFocus);
    });
  });

  describe('findById', () => {
    it('存在するIDの場合、週次フォーカスを返すこと', () => {
      const weeklyFocus: WeeklyFocus = {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      weeklyFocusesDb.save(weeklyFocus);
      const found = weeklyFocusesDb.findById('focus-1');

      expect(found).toEqual(weeklyFocus);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = weeklyFocusesDb.findById('not-exist');
      expect(found).toBeUndefined();
    });
  });

  describe('findByUserIdAndWeek', () => {
    it('指定したuserIdとweekStartDateの週次フォーカスを返すこと', () => {
      const weeklyFocus1: WeeklyFocus = {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      const weeklyFocus2: WeeklyFocus = {
        id: 'focus-2',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      const weeklyFocus3: WeeklyFocus = {
        id: 'focus-3',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-2',
        goalId: null,
        weekStartDate: '2025-12-16',
        createdAt: new Date().toISOString(),
      };

      weeklyFocusesDb.save(weeklyFocus1);
      weeklyFocusesDb.save(weeklyFocus2);
      weeklyFocusesDb.save(weeklyFocus3);

      const found = weeklyFocusesDb.findByUserIdAndWeek('user-1', '2025-12-09');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(weeklyFocus1);
      expect(found).toContainEqual(weeklyFocus2);
    });

    it('存在しないuserId/週の場合、空配列を返すこと', () => {
      const found = weeklyFocusesDb.findByUserIdAndWeek('not-exist', '2025-12-09');
      expect(found).toEqual([]);
    });
  });

  describe('findByUserId', () => {
    it('指定したuserIdの週次フォーカスをすべて返すこと', () => {
      const weeklyFocus1: WeeklyFocus = {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      const weeklyFocus2: WeeklyFocus = {
        id: 'focus-2',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        goalId: null,
        weekStartDate: '2025-12-16',
        createdAt: new Date().toISOString(),
      };

      const weeklyFocus3: WeeklyFocus = {
        id: 'focus-3',
        userId: 'user-2',
        itemType: 'goodPoint',
        itemId: 'gp-2',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      weeklyFocusesDb.save(weeklyFocus1);
      weeklyFocusesDb.save(weeklyFocus2);
      weeklyFocusesDb.save(weeklyFocus3);

      const found = weeklyFocusesDb.findByUserId('user-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(weeklyFocus1);
      expect(found).toContainEqual(weeklyFocus2);
    });

    it('存在しないuserIdの場合、空配列を返すこと', () => {
      const found = weeklyFocusesDb.findByUserId('not-exist');
      expect(found).toEqual([]);
    });
  });

  describe('delete', () => {
    it('指定したIDの週次フォーカスを削除すること', () => {
      const weeklyFocus: WeeklyFocus = {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      weeklyFocusesDb.save(weeklyFocus);
      weeklyFocusesDb.delete('focus-1');

      const found = weeklyFocusesDb.findById('focus-1');
      expect(found).toBeUndefined();
    });

    it('存在しないIDを削除しようとしてもエラーにならないこと', () => {
      expect(() => weeklyFocusesDb.delete('not-exist')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('すべての週次フォーカスを削除すること', () => {
      const weeklyFocus: WeeklyFocus = {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      weeklyFocusesDb.save(weeklyFocus);
      weeklyFocusesDb.clear();

      const found = weeklyFocusesDb.findById('focus-1');
      expect(found).toBeUndefined();
    });
  });
});

