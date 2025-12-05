import { describe, it, expect, beforeEach } from 'vitest';
import {
  DailyReportsDatabase,
  GoodPointsDatabase,
  ImprovementsDatabase,
} from './daily-reports.db.js';

describe('DailyReportsDatabase', () => {
  let db: DailyReportsDatabase;

  beforeEach(() => {
    db = new DailyReportsDatabase();
    db.clear();
  });

  describe('save', () => {
    it('日報を保存できること', () => {
      const report = {
        id: 'report-1',
        userId: 'user-1',
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: 'テスト学び',
        goodPointIds: ['gp-1'],
        improvementIds: ['imp-1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(report);
      const found = db.findById('report-1');

      expect(found).toEqual(report);
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

      db.save(report);
      const found = db.findById('report-1');

      expect(found).toEqual(report);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = db.findById('non-existent');
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

      db.save(report);
      const found = db.findByUserIdAndDate('user-1', '2025-12-05');

      expect(found).toEqual(report);
    });

    it('該当なしの場合、undefinedを返すこと', () => {
      const found = db.findByUserIdAndDate('user-1', '2025-12-06');
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

      db.save(report1);
      db.save(report2);
      db.save(report3);

      const reports = db.findAllByUserId('user-1');

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

      db.save(report);

      const updated = {
        ...report,
        events: '更新後のイベント',
        updatedAt: new Date().toISOString(),
      };

      db.update(updated);
      const found = db.findById('report-1');

      expect(found?.events).toBe('更新後のイベント');
    });
  });

  describe('clear', () => {
    it('全データを削除できること', () => {
      db.save({
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

      db.clear();
      const found = db.findById('report-1');

      expect(found).toBeUndefined();
    });
  });
});

describe('GoodPointsDatabase', () => {
  let db: GoodPointsDatabase;

  beforeEach(() => {
    db = new GoodPointsDatabase();
    db.clear();
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(goodPoint);
      const found = db.findById('gp-1');

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(gp1);
      db.save(gp2);

      const found = db.findByIds(['gp-1', 'gp-2']);

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(goodPoint);

      const updated = {
        ...goodPoint,
        status: '再現成功' as const,
        updatedAt: new Date().toISOString(),
      };

      db.update(updated);
      const found = db.findById('gp-1');

      expect(found?.status).toBe('再現成功');
    });
  });
});

describe('ImprovementsDatabase', () => {
  let db: ImprovementsDatabase;

  beforeEach(() => {
    db = new ImprovementsDatabase();
    db.clear();
  });

  describe('save', () => {
    it('改善点を保存できること', () => {
      const improvement = {
        id: 'imp-1',
        userId: 'user-1',
        content: 'テスト内容',
        action: 'テストアクション',
        status: '未着手' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(improvement);
      const found = db.findById('imp-1');

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const imp2 = {
        id: 'imp-2',
        userId: 'user-1',
        content: '内容2',
        action: null,
        status: '未着手' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(imp1);
      db.save(imp2);

      const found = db.findByIds(['imp-1', 'imp-2']);

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.save(improvement);

      const updated = {
        ...improvement,
        status: '完了' as const,
        updatedAt: new Date().toISOString(),
      };

      db.update(updated);
      const found = db.findById('imp-1');

      expect(found?.status).toBe('完了');
    });
  });
});

