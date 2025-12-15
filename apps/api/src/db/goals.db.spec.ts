import { describe, it, expect, beforeEach } from 'vitest';
import { GoalsDatabase } from './goals.db.js';
import { Goal } from '../models/daily-report.model.js';

describe('GoalsDatabase', () => {
  let db: GoalsDatabase;

  beforeEach(() => {
    db = new GoalsDatabase();
    db.clear();
  });

  describe('save', () => {
    it('目標を保存できること', () => {
      const goal: Goal = {
        id: 'goal-1',
        userId: 'user-1',
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

      db.save(goal);
      const found = db.findById('goal-1');

      expect(found).toEqual(goal);
    });
  });

  describe('findById', () => {
    it('存在するIDの場合、目標を返すこと', () => {
      const goal: Goal = {
        id: 'goal-1',
        userId: 'user-1',
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

      db.save(goal);
      const found = db.findById('goal-1');

      expect(found).toEqual(goal);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = db.findById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('findAllByUserId', () => {
    it('ユーザーIDで目標を取得できること', () => {
      const goal1: Goal = {
        id: 'goal-1',
        userId: 'user-1',
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

      const goal2: Goal = {
        id: 'goal-2',
        userId: 'user-1',
        name: '目標2',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const goal3: Goal = {
        id: 'goal-3',
        userId: 'user-2',
        name: '目標3',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(goal1);
      db.save(goal2);
      db.save(goal3);

      const found = db.findAllByUserId('user-1');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(goal1);
      expect(found).toContainEqual(goal2);
      expect(found).not.toContainEqual(goal3);
    });
  });

  describe('findByParentId', () => {
    it('親IDで下位目標を取得できること', () => {
      const parentGoal: Goal = {
        id: 'goal-parent',
        userId: 'user-1',
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

      const childGoal1: Goal = {
        id: 'goal-child-1',
        userId: 'user-1',
        name: '子目標1',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        parentId: 'goal-parent',
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const childGoal2: Goal = {
        id: 'goal-child-2',
        userId: 'user-1',
        name: '子目標2',
        description: null,
        startDate: '2025-04-01',
        endDate: '2025-06-30',
        parentId: 'goal-parent',
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(parentGoal);
      db.save(childGoal1);
      db.save(childGoal2);

      const found = db.findByParentId('goal-parent');

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(childGoal1);
      expect(found).toContainEqual(childGoal2);
    });

    it('parentIdがnullの場合、最上位目標を取得できること', () => {
      const rootGoal1: Goal = {
        id: 'goal-root-1',
        userId: 'user-1',
        name: 'ルート目標1',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const rootGoal2: Goal = {
        id: 'goal-root-2',
        userId: 'user-1',
        name: 'ルート目標2',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const childGoal: Goal = {
        id: 'goal-child',
        userId: 'user-1',
        name: '子目標',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        parentId: 'goal-root-1',
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(rootGoal1);
      db.save(rootGoal2);
      db.save(childGoal);

      const found = db.findByParentId(null);

      expect(found).toHaveLength(2);
      expect(found).toContainEqual(rootGoal1);
      expect(found).toContainEqual(rootGoal2);
      expect(found).not.toContainEqual(childGoal);
    });
  });

  describe('update', () => {
    it('存在する目標を更新できること', () => {
      const goal: Goal = {
        id: 'goal-1',
        userId: 'user-1',
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

      db.save(goal);

      const updatedGoal: Goal = {
        ...goal,
        name: '更新された目標',
        updatedAt: new Date().toISOString(),
      };

      db.update(updatedGoal);
      const found = db.findById('goal-1');

      expect(found?.name).toBe('更新された目標');
    });
  });

  describe('delete', () => {
    it('目標を削除できること', () => {
      const goal: Goal = {
        id: 'goal-1',
        userId: 'user-1',
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

      db.save(goal);
      db.delete('goal-1');
      const found = db.findById('goal-1');

      expect(found).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('すべての目標を削除できること', () => {
      const goal1: Goal = {
        id: 'goal-1',
        userId: 'user-1',
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

      const goal2: Goal = {
        id: 'goal-2',
        userId: 'user-1',
        name: '目標2',
        description: null,
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        parentId: null,
        goalType: null,
        successCriteria: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(goal1);
      db.save(goal2);
      db.clear();

      expect(db.findAllByUserId('user-1')).toHaveLength(0);
    });
  });
});

