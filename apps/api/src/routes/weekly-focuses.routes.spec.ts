import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { weeklyFocusesRouter } from './weekly-focuses.routes.js';
import { weeklyFocusesDb } from '../db/weekly-focuses.db.js';
import { goodPointsDb, improvementsDb } from '../db/daily-reports.db.js';
import { usersDb } from '../db/users.db.js';
import { generateToken } from '../middleware/auth.middleware.js';

describe('weeklyFocusesRouter', () => {
  let app: express.Application;
  let authToken: string;
  const testUserId = 'test-user-id';
  const testUserEmail = 'test@example.com';

  beforeEach(() => {
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

    weeklyFocusesDb.clear();
    goodPointsDb.clear();
    improvementsDb.clear();
  });

  afterEach(() => {
    usersDb.clear();
    weeklyFocusesDb.clear();
    goodPointsDb.clear();
    improvementsDb.clear();
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
      goodPointsDb.save(goodPoint);

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
      goodPointsDb.save(goodPoint);

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
        goodPointsDb.save(goodPoint);

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
      goodPointsDb.save(goodPoint6);

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
      goodPointsDb.save(goodPoint);

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

