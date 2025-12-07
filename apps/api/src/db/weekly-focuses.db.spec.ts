import { describe, it, expect, beforeEach } from 'vitest';
import { WeeklyFocusesDatabase } from './weekly-focuses.db.js';
import { WeeklyFocus } from '../models/daily-report.model.js';

describe('WeeklyFocusesDatabase', () => {
  let db: WeeklyFocusesDatabase;

  beforeEach(() => {
    db = new WeeklyFocusesDatabase();
    db.clear();
  });

  describe('save', () => {
    it('週次フォーカスを保存できること', () => {
      const weeklyFocus: WeeklyFocus = {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      db.save(weeklyFocus);
      const found = db.findById('focus-1');

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
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      db.save(weeklyFocus);
      const found = db.findById('focus-1');

      expect(found).toEqual(weeklyFocus);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = db.findById('not-exist');
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
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      const weeklyFocus2: WeeklyFocus = {
        id: 'focus-2',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      const weeklyFocus3: WeeklyFocus = {
        id: 'focus-3',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-2',
        weekStartDate: '2025-12-16',
        createdAt: new Date().toISOString(),
      };

      db.save(weeklyFocus1);
      db.save(weeklyFocus2);
      db.save(weeklyFocus3);

      const found = db.findByUserIdAndWeek('user-1', '2025-12-09');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(weeklyFocus1);
      expect(found).toContainEqual(weeklyFocus2);
    });

    it('存在しないuserId/週の場合、空配列を返すこと', () => {
      const found = db.findByUserIdAndWeek('not-exist', '2025-12-09');
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
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      const weeklyFocus2: WeeklyFocus = {
        id: 'focus-2',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        weekStartDate: '2025-12-16',
        createdAt: new Date().toISOString(),
      };

      const weeklyFocus3: WeeklyFocus = {
        id: 'focus-3',
        userId: 'user-2',
        itemType: 'goodPoint',
        itemId: 'gp-2',
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      db.save(weeklyFocus1);
      db.save(weeklyFocus2);
      db.save(weeklyFocus3);

      const found = db.findByUserId('user-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(weeklyFocus1);
      expect(found).toContainEqual(weeklyFocus2);
    });

    it('存在しないuserIdの場合、空配列を返すこと', () => {
      const found = db.findByUserId('not-exist');
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
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      db.save(weeklyFocus);
      db.delete('focus-1');

      const found = db.findById('focus-1');
      expect(found).toBeUndefined();
    });

    it('存在しないIDを削除しようとしてもエラーにならないこと', () => {
      expect(() => db.delete('not-exist')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('すべての週次フォーカスを削除すること', () => {
      const weeklyFocus: WeeklyFocus = {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        weekStartDate: '2025-12-09',
        createdAt: new Date().toISOString(),
      };

      db.save(weeklyFocus);
      db.clear();

      const found = db.findById('focus-1');
      expect(found).toBeUndefined();
    });
  });
});

