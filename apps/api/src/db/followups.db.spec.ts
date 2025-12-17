import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { FollowupsDatabase } from './followups.db.js';
import { UsersDatabase } from './users.db.js';
import { Followup } from '../models/daily-report.model.js';
import { initializeTables } from './database.js';

describe('FollowupsDatabase', () => {
  let db: DatabaseType;
  let followupsDb: FollowupsDatabase;
  let usersDb: UsersDatabase;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeTables(db);
    usersDb = new UsersDatabase(db);
    followupsDb = new FollowupsDatabase(db);

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
    it('フォローアップを保存できること', () => {
      const followup: Followup = {
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: 'テストメモ',
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      followupsDb.save(followup);
      const found = followupsDb.findById('followup-1');

      expect(found).toEqual(followup);
    });
  });

  describe('findById', () => {
    it('存在するIDの場合、フォローアップを返すこと', () => {
      const followup: Followup = {
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: null,
        date: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      followupsDb.save(followup);
      const found = followupsDb.findById('followup-1');

      expect(found).toEqual(followup);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = followupsDb.findById('not-exist');
      expect(found).toBeUndefined();
    });
  });

  describe('findByItemId', () => {
    it('指定したitemIdのフォローアップをすべて返すこと', () => {
      const followup1: Followup = {
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: 'メモ1',
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const followup2: Followup = {
        id: 'followup-2',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '進行中',
        memo: 'メモ2',
        date: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const followup3: Followup = {
        id: 'followup-3',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        status: '完了',
        memo: 'メモ3',
        date: '2025-12-11',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      followupsDb.save(followup1);
      followupsDb.save(followup2);
      followupsDb.save(followup3);

      const found = followupsDb.findByItemId('goodPoint', 'gp-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(followup1);
      expect(found).toContainEqual(followup2);
    });

    it('存在しないitemIdの場合、空配列を返すこと', () => {
      const found = followupsDb.findByItemId('goodPoint', 'not-exist');
      expect(found).toEqual([]);
    });
  });

  describe('findAllByUserId', () => {
    it('指定したuserIdのフォローアップをすべて返すこと', () => {
      const followup1: Followup = {
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: null,
        date: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const followup2: Followup = {
        id: 'followup-2',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        status: '完了',
        memo: null,
        date: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const followup3: Followup = {
        id: 'followup-3',
        userId: 'user-2',
        itemType: 'goodPoint',
        itemId: 'gp-2',
        status: '進行中',
        memo: null,
        date: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      followupsDb.save(followup1);
      followupsDb.save(followup2);
      followupsDb.save(followup3);

      const found = followupsDb.findAllByUserId('user-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(followup1);
      expect(found).toContainEqual(followup2);
    });

    it('存在しないuserIdの場合、空配列を返すこと', () => {
      const found = followupsDb.findAllByUserId('not-exist');
      expect(found).toEqual([]);
    });
  });

  describe('update', () => {
    it('フォローアップを更新できること', () => {
      const followup: Followup = {
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: '元のメモ',
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      followupsDb.save(followup);

      const updated: Followup = {
        ...followup,
        memo: '更新後のメモ',
        date: '2025-12-11',
        updatedAt: new Date().toISOString(),
      };

      followupsDb.update(updated);
      const found = followupsDb.findById('followup-1');

      expect(found?.memo).toBe('更新後のメモ');
      expect(found?.date).toBe('2025-12-11');
    });

    it('存在しないIDのフォローアップを更新してもエラーにならないこと', () => {
      const followup: Followup = {
        id: 'not-exist',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: null,
        date: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(() => followupsDb.update(followup)).not.toThrow();
    });
  });

  describe('delete', () => {
    it('指定したIDのフォローアップを削除すること', () => {
      const followup: Followup = {
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: 'テストメモ',
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      followupsDb.save(followup);
      followupsDb.delete('followup-1');

      const found = followupsDb.findById('followup-1');
      expect(found).toBeUndefined();
    });

    it('存在しないIDを削除してもエラーにならないこと', () => {
      expect(() => followupsDb.delete('not-exist')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('すべてのフォローアップを削除すること', () => {
      const followup: Followup = {
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: null,
        date: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      followupsDb.save(followup);
      followupsDb.clear();

      const found = followupsDb.findById('followup-1');
      expect(found).toBeUndefined();
    });
  });
});

