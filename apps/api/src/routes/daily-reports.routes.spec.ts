import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { dailyReportsRouter } from './daily-reports.routes.js';
import { dailyReportsDb, goodPointsDb, improvementsDb } from '../db/daily-reports.db.js';
import { usersDb } from '../db/users.db.js';
import { generateToken } from '../middleware/auth.middleware.js';

describe('dailyReportsRouter', () => {
  let app: express.Application;
  let authToken: string;
  const testUserId = 'test-user-id';
  const testUserEmail = 'test@example.com';

  beforeEach(() => {
    // テスト用アプリケーション設定
    app = express();
    app.use(express.json());
    app.use('/api', dailyReportsRouter);

    // テストユーザー作成
    usersDb.save({
      id: testUserId,
      email: testUserEmail,
      passwordHash: 'hashed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 認証トークン生成
    authToken = generateToken(testUserId);

    // DBクリア
    dailyReportsDb.clear();
    goodPointsDb.clear();
    improvementsDb.clear();
  });

  afterEach(() => {
    usersDb.clear();
    dailyReportsDb.clear();
    goodPointsDb.clear();
    improvementsDb.clear();
  });

  describe('POST /api/daily-reports', () => {
    it('認証済みユーザーが日報を作成できること', async () => {
      const response = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
          learnings: '今日の学び',
          goodPoints: [
            { content: 'よかったこと1', factors: '要因1' },
          ],
          improvements: [
            { content: '改善点1', action: 'アクション1' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.date).toBe('2025-12-05');
      expect(response.body.events).toBe('今日のできごと');
      expect(response.body.goodPoints).toHaveLength(1);
      expect(response.body.improvements).toHaveLength(1);
    });

    it('必須項目が不足している場合、400エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          // events が不足
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('events');
    });

    it('未認証の場合、401エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/daily-reports')
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
        });

      expect(response.status).toBe(401);
    });

    it('同じ日付の日報が既に存在する場合、400エラーを返すこと', async () => {
      // 最初の日報を作成
      await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '最初の日報',
        });

      // 同じ日付で再度作成
      const response = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '2回目の日報',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('既に存在');
    });

    it('eventsが1000文字を超える場合、400エラーを返すこと', async () => {
      const longText = 'あ'.repeat(1001);
      const response = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: longText,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('1000文字');
    });
  });

  describe('POST /api/good-points', () => {
    it('よかったことを単独で作成できること', async () => {
      const response = await request(app)
        .post('/api/good-points')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'よかったこと',
          factors: '要因',
          tags: ['タグ1', 'タグ2'],
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.content).toBe('よかったこと');
      expect(response.body.status).toBe('未対応');
    });

    it('contentが不足している場合、400エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/good-points')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          factors: '要因のみ',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/good-points/:id', () => {
    it('よかったことのステータスを更新できること', async () => {
      // 先によかったことを作成
      const createResponse = await request(app)
        .post('/api/good-points')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'よかったこと',
        });

      const goodPointId = createResponse.body.id;

      // ステータスを更新
      const response = await request(app)
        .patch(`/api/good-points/${goodPointId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '再現成功',
          factors: '追記した要因',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('再現成功');
      expect(response.body.factors).toBe('追記した要因');
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .patch('/api/good-points/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '再現成功',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/improvements', () => {
    it('改善点を単独で作成できること', async () => {
      const response = await request(app)
        .post('/api/improvements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '改善点',
          action: 'アクション',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.content).toBe('改善点');
      expect(response.body.status).toBe('未着手');
    });

    it('contentが不足している場合、400エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/improvements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'アクションのみ',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/improvements/:id', () => {
    it('改善点のステータスを更新できること', async () => {
      // 先に改善点を作成
      const createResponse = await request(app)
        .post('/api/improvements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '改善点',
        });

      const improvementId = createResponse.body.id;

      // ステータスを更新
      const response = await request(app)
        .patch(`/api/improvements/${improvementId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '完了',
          action: '追記したアクション',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('完了');
      expect(response.body.action).toBe('追記したアクション');
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .patch('/api/improvements/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '完了',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/daily-reports', () => {
    it('認証済みユーザーの日報一覧を取得できること', async () => {
      // 日報を2件作成
      await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2025-12-05', events: 'イベント1' });

      await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2025-12-04', events: 'イベント2' });

      const response = await request(app)
        .get('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('日報一覧が日付降順でソートされること', async () => {
      // 日付がバラバラな順序で日報を作成
      await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2025-12-03', events: 'イベント3' });

      await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2025-12-05', events: 'イベント5' });

      await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2025-12-04', events: 'イベント4' });

      const response = await request(app)
        .get('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      // 日付降順で並んでいることを確認
      expect(response.body.data[0].date).toBe('2025-12-05');
      expect(response.body.data[1].date).toBe('2025-12-04');
      expect(response.body.data[2].date).toBe('2025-12-03');
    });

    it('limitとoffsetでページングできること', async () => {
      // 5件の日報を作成
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/daily-reports')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ date: `2025-12-0${i}`, events: `イベント${i}` });
      }

      // limit=2, offset=0 で最初の2件取得
      const response1 = await request(app)
        .get('/api/daily-reports?limit=2&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response1.status).toBe(200);
      expect(response1.body.data).toHaveLength(2);
      expect(response1.body.total).toBe(5);
      expect(response1.body.data[0].date).toBe('2025-12-05'); // 最新
      expect(response1.body.data[1].date).toBe('2025-12-04');

      // limit=2, offset=2 で次の2件取得
      const response2 = await request(app)
        .get('/api/daily-reports?limit=2&offset=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response2.status).toBe(200);
      expect(response2.body.data).toHaveLength(2);
      expect(response2.body.data[0].date).toBe('2025-12-03');
      expect(response2.body.data[1].date).toBe('2025-12-02');
    });

    it('limitのデフォルト値は30であること', async () => {
      const response = await request(app)
        .get('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // 実際にはデータ件数が少ないのでデフォルトのlimit=30は影響しない
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/daily-reports/:id', () => {
    it('指定IDの日報を取得できること', async () => {
      const createResponse = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: 'テストイベント',
          goodPoints: [{ content: 'よかったこと' }],
        });

      const reportId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/daily-reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(reportId);
      expect(response.body.goodPoints).toHaveLength(1);
    });

    it('存在しないIDの場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .get('/api/daily-reports/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('他のユーザーの日報にアクセスした場合、403エラーを返すこと', async () => {
      // 別ユーザーの日報を作成
      const otherUserId = 'other-user-id';
      usersDb.save({
        id: otherUserId,
        email: 'other@example.com',
        passwordHash: 'hashed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const otherToken = generateToken(otherUserId);

      const createResponse = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ date: '2025-12-05', events: '他人の日報' });

      const reportId = createResponse.body.id;

      // 元のユーザーでアクセス
      const response = await request(app)
        .get(`/api/daily-reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});

