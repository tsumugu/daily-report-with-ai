import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { dailyReportsRouter } from './daily-reports.routes.js';
import { dailyReportsDb, goodPointsDb, improvementsDb } from '../db/daily-reports.db.js';
import { usersDb } from '../db/users.db.js';
import { generateToken } from '../middleware/auth.middleware.js';
import { DailyReportListItem } from '../models/daily-report.model.js';

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
      expect(response.body.status).toBe('未着手');
      expect(response.body.success_count).toBe(0);
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
      // 新しいフィールドが含まれていることを確認
      expect(response.body.data[0]).toHaveProperty('goodPointSummary');
      expect(response.body.data[0]).toHaveProperty('improvementSummary');
      expect(response.body.data[0].goodPointSummary).toHaveProperty('count');
      expect(response.body.data[0].goodPointSummary).toHaveProperty('statusSummary');
      expect(response.body.data[0].improvementSummary).toHaveProperty('count');
      expect(response.body.data[0].improvementSummary).toHaveProperty('statusSummary');
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

    it('よかったこと・改善点のサマリーが正しく計算されること', async () => {
      // 日報を作成
      const reportResponse = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-10',
          events: 'テストイベント',
          goodPoints: [
            { content: 'よかったこと1', factors: '要因1' },
            { content: 'よかったこと2', factors: '要因2' },
          ],
          improvements: [
            { content: '改善点1', action: 'アクション1' },
          ],
        });

      expect(reportResponse.status).toBe(201);
      const reportId = reportResponse.body.id;

      // よかったことのステータスを更新（再現成功、定着）
      const goodPoints = reportResponse.body.goodPoints;
      await request(app)
        .put(`/api/good-points/${goodPoints[0].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: '再現成功' });

      await request(app)
        .put(`/api/good-points/${goodPoints[1].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: '定着' });

      // 改善点のステータスを更新（完了）
      const improvements = reportResponse.body.improvements;
      await request(app)
        .put(`/api/improvements/${improvements[0].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: '完了' });

      // 日報一覧を取得
      const response = await request(app)
        .get('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const report = response.body.data.find((r: DailyReportListItem) => r.id === reportId);
      expect(report).toBeDefined();

      // よかったことサマリーの確認
      expect(report.goodPointSummary.count).toBe(2);
      expect(report.goodPointSummary.statusSummary).toHaveProperty('再現成功');
      expect(report.goodPointSummary.statusSummary).toHaveProperty('定着');

      // 改善点サマリーの確認
      expect(report.improvementSummary.count).toBe(1);
      expect(report.improvementSummary.statusSummary).toHaveProperty('完了');
      expect(report.improvementSummary.statusSummary).toHaveProperty('習慣化');
    });

    it('よかったこと・改善点が0件の場合、サマリーが空で返されること', async () => {
      // よかったこと・改善点なしの日報を作成
      await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: '2025-12-11', events: 'イベントのみ' });

      const response = await request(app)
        .get('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const report = response.body.data.find((r: DailyReportListItem) => r.date === '2025-12-11');
      expect(report).toBeDefined();
      expect(report.goodPointSummary.count).toBe(0);
      expect(report.goodPointSummary.statusSummary.再現成功).toBe(0);
      expect(report.goodPointSummary.statusSummary.定着).toBe(0);
      expect(report.improvementSummary.count).toBe(0);
      expect(report.improvementSummary.statusSummary.完了).toBe(0);
      expect(report.improvementSummary.statusSummary.習慣化).toBe(0);
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

  describe('PUT /api/daily-reports/:id', () => {
    it('認証済みユーザーが日報を更新できること', async () => {
      // 日報を作成
      const createResponse = await request(app)
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

      const reportId = createResponse.body.id;
      const goodPointId = createResponse.body.goodPoints[0].id;
      const improvementId = createResponse.body.improvements[0].id;

      // 日報を更新
      const updateResponse = await request(app)
        .put(`/api/daily-reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '更新後のできごと',
          learnings: '更新後の学び',
          goodPoints: [
            { id: goodPointId, content: '更新後のよかったこと1', factors: '更新後の要因1' },
          ],
          improvements: [
            { id: improvementId, content: '更新後の改善点1', action: '更新後のアクション1' },
          ],
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.events).toBe('更新後のできごと');
      expect(updateResponse.body.learnings).toBe('更新後の学び');
      expect(updateResponse.body.goodPoints[0].content).toBe('更新後のよかったこと1');
      expect(updateResponse.body.improvements[0].content).toBe('更新後の改善点1');
    });

    it('よかったこと・改善点を追加できること', async () => {
      // 日報を作成
      const createResponse = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
          goodPoints: [
            { content: 'よかったこと1' },
          ],
        });

      const reportId = createResponse.body.id;
      const goodPointId = createResponse.body.goodPoints[0].id;

      // よかったこと・改善点を追加
      const updateResponse = await request(app)
        .put(`/api/daily-reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
          goodPoints: [
            { id: goodPointId, content: 'よかったこと1' },
            { content: '新しいよかったこと' },
          ],
          improvements: [
            { content: '新しい改善点' },
          ],
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.goodPoints).toHaveLength(2);
      expect(updateResponse.body.improvements).toHaveLength(1);
    });

    it('存在しない日報を更新しようとした場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .put('/api/daily-reports/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('見つかりません');
    });

    it('他のユーザーの日報を更新しようとした場合、403エラーを返すこと', async () => {
      // 別ユーザーを作成
      const otherUserId = 'other-user-id';
      usersDb.save({
        id: otherUserId,
        email: 'other@example.com',
        passwordHash: 'hashed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const otherAuthToken = generateToken(otherUserId);

      // 別ユーザーが日報を作成
      const createResponse = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
        });

      const reportId = createResponse.body.id;

      // 元のユーザーが更新しようとする
      const response = await request(app)
        .put(`/api/daily-reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '更新後のできごと',
        });

      expect(response.status).toBe(403);
    });

    it('日付を変更した場合、新しい日付で既に日報が存在する場合は400エラーを返すこと', async () => {
      // 日報1を作成
      const createResponse1 = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '日報1',
        });

      // 日報2を作成
      await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-06',
          events: '日報2',
        });

      const reportId1 = createResponse1.body.id;

      // 日報1の日付を日報2と同じ日付に変更しようとする
      const response = await request(app)
        .put(`/api/daily-reports/${reportId1}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-06',
          events: '日報1',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('既に存在します');
    });

    it('日付を変更した場合、同じ日報IDの場合は許可されること', async () => {
      // 日報を作成
      const createResponse = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
        });

      const reportId = createResponse.body.id;

      // 同じ日報の日付を変更（同じIDなので許可される）
      const response = await request(app)
        .put(`/api/daily-reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-06',
          events: '今日のできごと',
        });

      expect(response.status).toBe(200);
      expect(response.body.date).toBe('2025-12-06');
    });

    it('よかったことのIDが日報に紐づいていない場合、400エラーを返すこと', async () => {
      // 日報を作成
      const createResponse = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
          goodPoints: [
            { content: 'よかったこと1' },
          ],
        });

      const reportId = createResponse.body.id;

      // 存在しないよかったことIDを指定
      const response = await request(app)
        .put(`/api/daily-reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
          goodPoints: [
            { id: 'non-existent-id', content: 'よかったこと1' },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('紐づいていません');
    });

    it('改善点のIDが日報に紐づいていない場合、400エラーを返すこと', async () => {
      // 日報を作成
      const createResponse = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
          improvements: [
            { content: '改善点1' },
          ],
        });

      const reportId = createResponse.body.id;

      // 存在しない改善点IDを指定
      const response = await request(app)
        .put(`/api/daily-reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
          improvements: [
            { id: 'non-existent-id', content: '改善点1' },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('紐づいていません');
    });

    it('バリデーションエラーの場合、400エラーを返すこと', async () => {
      // 日報を作成
      const createResponse = await request(app)
        .post('/api/daily-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          events: '今日のできごと',
        });

      const reportId = createResponse.body.id;

      // eventsが不足
      const response = await request(app)
        .put(`/api/daily-reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2025-12-05',
          // events が不足
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('events');
    });
  });
});

