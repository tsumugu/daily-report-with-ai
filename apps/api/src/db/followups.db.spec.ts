import { describe, it, expect, beforeEach } from 'vitest';
import { FollowupsDatabase } from './followups.db.js';
import { Followup } from '../models/daily-report.model.js';

describe('FollowupsDatabase', () => {
  let db: FollowupsDatabase;

  beforeEach(() => {
    db = new FollowupsDatabase();
    db.clear();
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

      db.save(followup);
      const found = db.findById('followup-1');

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

      db.save(followup);
      const found = db.findById('followup-1');

      expect(found).toEqual(followup);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = db.findById('not-exist');
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

      db.save(followup1);
      db.save(followup2);
      db.save(followup3);

      const found = db.findByItemId('goodPoint', 'gp-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(followup1);
      expect(found).toContainEqual(followup2);
    });

    it('存在しないitemIdの場合、空配列を返すこと', () => {
      const found = db.findByItemId('goodPoint', 'not-exist');
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

      db.save(followup1);
      db.save(followup2);
      db.save(followup3);

      const found = db.findAllByUserId('user-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(followup1);
      expect(found).toContainEqual(followup2);
    });

    it('存在しないuserIdの場合、空配列を返すこと', () => {
      const found = db.findAllByUserId('not-exist');
      expect(found).toEqual([]);
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

      db.save(followup);
      db.delete('followup-1');

      const found = db.findById('followup-1');
      expect(found).toBeUndefined();
    });

    it('存在しないIDを削除してもエラーにならないこと', () => {
      expect(() => db.delete('not-exist')).not.toThrow();
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

      db.save(followup);
      db.clear();

      const found = db.findById('followup-1');
      expect(found).toBeUndefined();
    });
  });
});

