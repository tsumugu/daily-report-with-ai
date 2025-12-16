import { describe, it, expect, beforeEach } from 'vitest';
import { DailyReportGoalsDatabase } from './daily-report-goals.db.js';

describe('DailyReportGoalsDatabase', () => {
  let db: DailyReportGoalsDatabase;

  beforeEach(() => {
    db = new DailyReportGoalsDatabase();
    db.clear();
  });

  describe('save', () => {
    it('日報と目標の関連付けを保存できること', () => {
      const dailyReportGoal = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };

      db.save(dailyReportGoal);
      const found = db.findById('drg-1');

      expect(found).toEqual(dailyReportGoal);
    });
  });

  describe('findById', () => {
    it('存在するIDの場合、関連付けを返すこと', () => {
      const dailyReportGoal = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };

      db.save(dailyReportGoal);
      const found = db.findById('drg-1');

      expect(found).toEqual(dailyReportGoal);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = db.findById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('findByDailyReportId', () => {
    it('指定した日報IDに関連付けられた目標を返すこと', () => {
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

      db.save(drg1);
      db.save(drg2);
      db.save(drg3);

      const found = db.findByDailyReportId('report-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(drg1);
      expect(found).toContainEqual(drg2);
    });

    it('関連付けがない場合、空配列を返すこと', () => {
      const found = db.findByDailyReportId('report-1');
      expect(found).toEqual([]);
    });
  });

  describe('findByDailyReportIds', () => {
    it('複数の日報IDに関連付けられた目標をMapで返すこと（N+1対策）', () => {
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

      db.save(drg1);
      db.save(drg2);
      db.save(drg3);

      const found = db.findByDailyReportIds(['report-1', 'report-2', 'report-3']);

      expect(found.size).toBe(2);
      expect(found.get('report-1')).toHaveLength(2);
      expect(found.get('report-1')).toContainEqual(drg1);
      expect(found.get('report-1')).toContainEqual(drg2);
      expect(found.get('report-2')).toHaveLength(1);
      expect(found.get('report-2')).toContainEqual(drg3);
      expect(found.has('report-3')).toBe(false);
    });

    it('空配列を渡した場合、空のMapを返すこと', () => {
      const found = db.findByDailyReportIds([]);
      expect(found.size).toBe(0);
    });
  });

  describe('findByGoalId', () => {
    it('指定した目標IDに関連付けられた日報を返すこと', () => {
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

      db.save(drg1);
      db.save(drg2);
      db.save(drg3);

      const found = db.findByGoalId('goal-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(drg1);
      expect(found).toContainEqual(drg2);
    });

    it('関連付けがない場合、空配列を返すこと', () => {
      const found = db.findByGoalId('goal-1');
      expect(found).toEqual([]);
    });
  });

  describe('deleteByDailyReportId', () => {
    it('指定した日報IDの関連付けをすべて削除すること（カスケード削除）', () => {
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

      db.save(drg1);
      db.save(drg2);
      db.save(drg3);

      db.deleteByDailyReportId('report-1');

      const found1 = db.findByDailyReportId('report-1');
      const found2 = db.findByDailyReportId('report-2');

      expect(found1).toHaveLength(0);
      expect(found2).toHaveLength(1);
      expect(found2).toContainEqual(drg3);
    });

    it('存在しない日報IDを指定しても、エラーにならないこと', () => {
      expect(() => db.deleteByDailyReportId('non-existent')).not.toThrow();
    });
  });

  describe('delete', () => {
    it('指定したIDの関連付けを削除すること', () => {
      const dailyReportGoal = {
        id: 'drg-1',
        dailyReportId: 'report-1',
        goalId: 'goal-1',
        createdAt: new Date().toISOString(),
      };

      db.save(dailyReportGoal);
      db.delete('drg-1');

      const found = db.findById('drg-1');
      expect(found).toBeUndefined();
    });

    it('存在しないIDを指定しても、エラーにならないこと', () => {
      expect(() => db.delete('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('すべての関連付けを削除すること', () => {
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

      db.save(drg1);
      db.save(drg2);
      db.clear();

      const found1 = db.findById('drg-1');
      const found2 = db.findById('drg-2');

      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();
    });
  });
});
