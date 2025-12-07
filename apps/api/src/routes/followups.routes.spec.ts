import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { followupsRouter } from './followups.routes.js';
import { followupsDb } from '../db/followups.db.js';
import { goodPointsDb, improvementsDb, dailyReportsDb } from '../db/daily-reports.db.js';
import { usersDb } from '../db/users.db.js';
import { generateToken } from '../middleware/auth.middleware.js';

describe('followupsRouter', () => {
  let app: express.Application;
  let authToken: string;
  const testUserId = 'test-user-id';
  const testUserEmail = 'test@example.com';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', followupsRouter);

    usersDb.save({
      id: testUserId,
      email: testUserEmail,
      passwordHash: 'hashed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    authToken = generateToken(testUserId);

    followupsDb.clear();
    goodPointsDb.clear();
    improvementsDb.clear();
    dailyReportsDb.clear();
  });

  afterEach(() => {
    usersDb.clear();
    followupsDb.clear();
    goodPointsDb.clear();
    improvementsDb.clear();
    dailyReportsDb.clear();
  });

  describe('POST /api/good-points/:id/followups', () => {
    it('よかったことにフォローアップを追加できること', async () => {
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint);

      const response = await request(app)
        .post('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '再現成功',
          memo: 'テストメモ',
          date: '2025-12-10',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.itemType).toBe('goodPoint');
      expect(response.body.itemId).toBe('gp-1');
      expect(response.body.status).toBe('再現成功');
      expect(response.body.memo).toBe('テストメモ');
      expect(response.body.date).toBe('2025-12-10');

      // success_countがインクリメントされているか確認
      const updated = goodPointsDb.findById('gp-1');
      expect(updated?.success_count).toBe(1);
    });

    it('ステータスが「再現成功」の場合、dateが必須であること', async () => {
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint);

      const response = await request(app)
        .post('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '再現成功',
          memo: 'テストメモ',
          // date が不足
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('date');
    });

    it('success_count >= 3 の場合、statusが「定着」に自動更新されること', async () => {
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '再現成功' as const,
        success_count: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint);

      const response = await request(app)
        .post('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '再現成功',
          date: '2025-12-10',
        });

      expect(response.status).toBe(201);

      const updated = goodPointsDb.findById('gp-1');
      expect(updated?.success_count).toBe(3);
      expect(updated?.status).toBe('定着');
    });

    it('未認証の場合、401エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/good-points/gp-1/followups')
        .send({
          status: '再現成功',
          date: '2025-12-10',
        });

      expect(response.status).toBe(401);
    });

    it('存在しないよかったことの場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/good-points/not-exist/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '再現成功',
          date: '2025-12-10',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/improvements/:id/followups', () => {
    it('改善点にフォローアップを追加できること', async () => {
      const improvement = {
        id: 'imp-1',
        userId: testUserId,
        content: 'テスト改善点',
        action: null,
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      improvementsDb.save(improvement);

      const response = await request(app)
        .post('/api/improvements/imp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '完了',
          memo: 'テストメモ',
          date: '2025-12-10',
        });

      expect(response.status).toBe(201);
      expect(response.body.itemType).toBe('improvement');
      expect(response.body.itemId).toBe('imp-1');
      expect(response.body.status).toBe('完了');

      const updated = improvementsDb.findById('imp-1');
      expect(updated?.success_count).toBe(1);
    });

    it('ステータスが「完了」の場合、dateが必須であること', async () => {
      const improvement = {
        id: 'imp-1',
        userId: testUserId,
        content: 'テスト改善点',
        action: null,
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      improvementsDb.save(improvement);

      const response = await request(app)
        .post('/api/improvements/imp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '完了',
          // date が不足
        });

      expect(response.status).toBe(400);
    });

    it('success_count >= 3 の場合、statusが「習慣化」に自動更新されること', async () => {
      const improvement = {
        id: 'imp-1',
        userId: testUserId,
        content: 'テスト改善点',
        action: null,
        status: '完了' as const,
        success_count: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      improvementsDb.save(improvement);

      await request(app)
        .post('/api/improvements/imp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '完了',
          date: '2025-12-10',
        });

      const updated = improvementsDb.findById('imp-1');
      expect(updated?.success_count).toBe(3);
      expect(updated?.status).toBe('習慣化');
    });
  });

  describe('GET /api/good-points/:id/followups', () => {
    it('よかったことのフォローアップ履歴を取得できること', async () => {
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint);

      const followup1 = {
        id: 'followup-1',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: 'メモ1',
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      followupsDb.save(followup1);

      const response = await request(app)
        .get('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('followup-1');
    });
  });

  describe('GET /api/followups', () => {
    it('フォロー項目一覧を取得できること', async () => {
      const report = {
        id: 'report-1',
        userId: testUserId,
        date: '2025-12-05',
        events: 'テスト',
        learnings: null,
        goodPointIds: ['gp-1'],
        improvementIds: ['imp-1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dailyReportsDb.save(report);

      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '進行中' as const,
        success_count: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint);

      const improvement = {
        id: 'imp-1',
        userId: testUserId,
        content: 'テスト改善点',
        action: null,
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      improvementsDb.save(improvement);

      const response = await request(app)
        .get('/api/followups?status=未着手,進行中')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('フィルタが適用されること', async () => {
      const report = {
        id: 'report-1',
        userId: testUserId,
        date: '2025-12-05',
        events: 'テスト',
        learnings: null,
        goodPointIds: ['gp-1'],
        improvementIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dailyReportsDb.save(report);

      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '進行中' as const,
        success_count: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint);

      const response = await request(app)
        .get('/api/followups?status=進行中&itemType=goodPoint')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].itemType).toBe('goodPoint');
    });
  });
});

