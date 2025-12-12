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

  // 過去の日付を生成するヘルパー関数（未来日付チェックを回避）
  const getPastDate = (daysAgo = 1): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

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
    it(
      'よかったことにエピソードを追加できること（status任意、自動設定）',
      async () => {
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

      const pastDate = getPastDate();

      const response = await request(app)
        .post('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          memo: 'テストメモ',
          date: pastDate,
        });

      if (response.status !== 201) {
        console.error('Error response:', JSON.stringify(response.body, null, 2));
        console.error('Response status:', response.status);
      }
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.itemType).toBe('goodPoint');
      expect(response.body.itemId).toBe('gp-1');
      expect(response.body.status).toBe('再現成功'); // 自動設定
      expect(response.body.memo).toBe('テストメモ');
      expect(response.body.date).toBe(pastDate);

      // エピソード数がカウントされ、ステータスが自動更新されているか確認
      const updated = goodPointsDb.findById('gp-1');
      expect(updated?.success_count).toBe(1);
      expect(updated?.status).toBe('進行中'); // 1件なので「進行中」
      },
      { timeout: 2000 }
    );

    it('statusが指定されている場合も動作すること（後方互換性）', async () => {
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
          date: getPastDate(),
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('再現成功');
    });

    it('dateが必須であること', async () => {
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
          memo: 'テストメモ',
          // date が不足
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('date は必須です');
    });

    it('今日の日付は許可すること', async () => {
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

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: todayStr,
          memo: 'テストメモ',
        });

      expect(response.status).toBe(201);
      expect(response.body.date).toBe(todayStr);
    });

    it('未来日付は許可しないこと', async () => {
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

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: tomorrowStr,
          memo: 'テストメモ',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('未来の日付は入力できません');
    });

    it('エピソード数が3件以上の場合、statusが「定着」に自動更新されること', async () => {
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '進行中' as const,
        success_count: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint);

      // 既存のエピソードを2件追加
      const followup1 = {
        id: 'followup-1',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: null,
        date: '2025-12-08',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const followup2 = {
        id: 'followup-2',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: null,
        date: '2025-12-09',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      followupsDb.save(followup1);
      followupsDb.save(followup2);

      const response = await request(app)
        .post('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: getPastDate(),
        });

      expect(response.status).toBe(201);

      const updated = goodPointsDb.findById('gp-1');
      expect(updated?.success_count).toBe(3);
      expect(updated?.status).toBe('定着'); // 3件以上なので「定着」
    });

    it('未認証の場合、401エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/good-points/gp-1/followups')
        .send({
          status: '再現成功',
          date: getPastDate(),
        });

      expect(response.status).toBe(401);
    });

    it('存在しないよかったことの場合、404エラーを返すこと', async () => {
      const response = await request(app)
        .post('/api/good-points/not-exist/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: '再現成功',
          date: getPastDate(),
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/improvements/:id/followups', () => {
    it('改善点にアクションを追加できること（status任意、自動設定）', async () => {
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
          memo: 'テストメモ',
          date: getPastDate(),
        });

      expect(response.status).toBe(201);
      expect(response.body.itemType).toBe('improvement');
      expect(response.body.itemId).toBe('imp-1');
      expect(response.body.status).toBe('完了'); // 自動設定

      // アクション数がカウントされ、ステータスが自動更新されているか確認
      const updated = improvementsDb.findById('imp-1');
      expect(updated?.success_count).toBe(1);
      expect(updated?.status).toBe('進行中'); // 1件なので「進行中」
    });

    it('statusが指定されている場合も動作すること（後方互換性）', async () => {
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
          date: getPastDate(),
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('完了');
    });

    it('dateが必須であること', async () => {
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
          memo: 'テストメモ',
          // date が不足
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('date は必須です');
    });

    it('アクション数が3件以上の場合、statusが「習慣化」に自動更新されること', async () => {
      const improvement = {
        id: 'imp-1',
        userId: testUserId,
        content: 'テスト改善点',
        action: null,
        status: '進行中' as const,
        success_count: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      improvementsDb.save(improvement);

      // 既存のアクションを2件追加
      const followup1 = {
        id: 'followup-1',
        userId: testUserId,
        itemType: 'improvement' as const,
        itemId: 'imp-1',
        status: '完了' as const,
        memo: null,
        date: '2025-12-08',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const followup2 = {
        id: 'followup-2',
        userId: testUserId,
        itemType: 'improvement' as const,
        itemId: 'imp-1',
        status: '完了' as const,
        memo: null,
        date: '2025-12-09',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      followupsDb.save(followup1);
      followupsDb.save(followup2);

      await request(app)
        .post('/api/improvements/imp-1/followups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: getPastDate(),
        });

      const updated = improvementsDb.findById('imp-1');
      expect(updated?.success_count).toBe(3);
      expect(updated?.status).toBe('習慣化'); // 3件以上なので「習慣化」
    });
  });

  describe('GET /api/good-points/:id/followups', () => {
    it('よかったことのエピソード一覧を取得できること（countとstatusを含む）', async () => {
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '進行中' as const,
        success_count: 2,
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
      const followup2 = {
        id: 'followup-2',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: 'メモ2',
        date: '2025-12-09',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      followupsDb.save(followup1);
      followupsDb.save(followup2);

      const response = await request(app)
        .get('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].id).toBe('followup-1');
      expect(response.body.data[0].date).toBe('2025-12-10');
      expect(response.body.data[0].memo).toBe('メモ1');
      expect(response.body.data[0].status).toBeUndefined(); // statusはレスポンスに含まれない
      expect(response.body.count).toBe(2);
      expect(response.body.status).toBe('進行中');
    });

    it('エピソードが0件の場合、count=0、status=未着手を返すこと', async () => {
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
        .get('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
      expect(response.body.status).toBe('未着手');
    });

    it('既存のフォローアップでstatusが「再現成功」以外の場合はカウントされないこと', async () => {
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

      // 「再現成功」のエピソード
      const followup1 = {
        id: 'followup-1',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: null,
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // 「進行中」のフォローアップ（既存データ、カウントされない）
      const followup2 = {
        id: 'followup-2',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '進行中' as const,
        memo: null,
        date: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      followupsDb.save(followup1);
      followupsDb.save(followup2);

      const response = await request(app)
        .get('/api/good-points/gp-1/followups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1); // 「再現成功」のみカウント
      expect(response.body.status).toBe('進行中');
    });
  });

  describe('DELETE /api/good-points/:id/followups/:followupId', () => {
    it('エピソードを削除できること', async () => {
      const goodPoint = {
        id: 'gp-1',
        userId: testUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '進行中' as const,
        success_count: 2,
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
        memo: null,
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const followup2 = {
        id: 'followup-2',
        userId: testUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: null,
        date: '2025-12-09',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      followupsDb.save(followup1);
      followupsDb.save(followup2);

      const response = await request(app)
        .delete('/api/good-points/gp-1/followups/followup-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('エピソードを削除しました');

      // エピソードが削除されているか確認
      const followup = followupsDb.findById('followup-1');
      expect(followup).toBeUndefined();

      // ステータスが自動更新されているか確認
      const updated = goodPointsDb.findById('gp-1');
      expect(updated?.success_count).toBe(1);
      expect(updated?.status).toBe('進行中');
    });

    it('存在しないエピソードを削除しようとした場合、404エラーを返すこと', async () => {
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
        .delete('/api/good-points/gp-1/followups/not-exist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('エピソードが見つかりません');
    });

    it('他のユーザーのエピソードを削除しようとした場合、403エラーを返すこと', async () => {
      const otherUserId = 'other-user-id';
      const goodPoint = {
        id: 'gp-1',
        userId: otherUserId,
        content: 'テストよかったこと',
        factors: null,
        tags: [],
        status: '未着手' as const,
        success_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goodPointsDb.save(goodPoint);

      const followup = {
        id: 'followup-1',
        userId: otherUserId,
        itemType: 'goodPoint' as const,
        itemId: 'gp-1',
        status: '再現成功' as const,
        memo: null,
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      followupsDb.save(followup);

      const response = await request(app)
        .delete('/api/good-points/gp-1/followups/followup-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/improvements/:id/followups/:followupId', () => {
    it('アクションを削除できること', async () => {
      const improvement = {
        id: 'imp-1',
        userId: testUserId,
        content: 'テスト改善点',
        action: null,
        status: '進行中' as const,
        success_count: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      improvementsDb.save(improvement);

      const followup1 = {
        id: 'followup-1',
        userId: testUserId,
        itemType: 'improvement' as const,
        itemId: 'imp-1',
        status: '完了' as const,
        memo: null,
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const followup2 = {
        id: 'followup-2',
        userId: testUserId,
        itemType: 'improvement' as const,
        itemId: 'imp-1',
        status: '完了' as const,
        memo: null,
        date: '2025-12-09',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      followupsDb.save(followup1);
      followupsDb.save(followup2);

      const response = await request(app)
        .delete('/api/improvements/imp-1/followups/followup-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('アクションを削除しました');

      // アクションが削除されているか確認
      const followup = followupsDb.findById('followup-1');
      expect(followup).toBeUndefined();

      // ステータスが自動更新されているか確認
      const updated = improvementsDb.findById('imp-1');
      expect(updated?.success_count).toBe(1);
      expect(updated?.status).toBe('進行中');
    });

    it('存在しないアクションを削除しようとした場合、404エラーを返すこと', async () => {
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
        .delete('/api/improvements/imp-1/followups/not-exist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('アクションが見つかりません');
    });
  });

  describe('GET /api/improvements/:id/followups', () => {
    it('改善点のアクション一覧を取得できること（countとstatusを含む）', async () => {
      const improvement = {
        id: 'imp-1',
        userId: testUserId,
        content: 'テスト改善点',
        action: null,
        status: '進行中' as const,
        success_count: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      improvementsDb.save(improvement);

      const followup1 = {
        id: 'followup-1',
        userId: testUserId,
        itemType: 'improvement' as const,
        itemId: 'imp-1',
        status: '完了' as const,
        memo: 'メモ1',
        date: '2025-12-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const followup2 = {
        id: 'followup-2',
        userId: testUserId,
        itemType: 'improvement' as const,
        itemId: 'imp-1',
        status: '完了' as const,
        memo: 'メモ2',
        date: '2025-12-09',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      followupsDb.save(followup1);
      followupsDb.save(followup2);

      const response = await request(app)
        .get('/api/improvements/imp-1/followups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].id).toBe('followup-1');
      expect(response.body.data[0].date).toBe('2025-12-10');
      expect(response.body.data[0].memo).toBe('メモ1');
      expect(response.body.data[0].status).toBeUndefined(); // statusはレスポンスに含まれない
      expect(response.body.count).toBe(2);
      expect(response.body.status).toBe('進行中');
    });

    it('アクションが0件の場合、count=0、status=未着手を返すこと', async () => {
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
        .get('/api/improvements/imp-1/followups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
      expect(response.body.status).toBe('未着手');
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

