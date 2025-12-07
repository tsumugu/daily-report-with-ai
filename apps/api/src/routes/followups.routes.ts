import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { followupsDb } from '../db/followups.db.js';
import { goodPointsDb, improvementsDb, dailyReportsDb } from '../db/daily-reports.db.js';
import {
  Followup,
  CreateFollowupRequest,
  GoodPoint,
  Improvement,
  FollowupItem,
  FollowupItemsResponse,
} from '../models/daily-report.model.js';

export const followupsRouter = Router();

// 認証ミドルウェアを全ルートに適用
followupsRouter.use(authMiddleware);

/**
 * バリデーションヘルパー
 */
const MAX_MEMO_LENGTH = 500;

function validateFollowup(body: CreateFollowupRequest, status: string): string | null {
  if (!body.status) {
    return 'status は必須です';
  }

  if (body.memo && body.memo.length > MAX_MEMO_LENGTH) {
    return `memo は${MAX_MEMO_LENGTH}文字以内で入力してください`;
  }

  // ステータスが「再現成功」「完了」の場合、dateは必須
  if ((status === '再現成功' || status === '完了') && !body.date) {
    return 'date は必須です';
  }

  return null;
}

/**
 * フォロー項目一覧を取得
 */
function getFollowupItems(
  userId: string,
  statusFilter?: string,
  itemTypeFilter?: string
): FollowupItem[] {
  const items: FollowupItem[] = [];

  // すべての日報を取得
  const reports = dailyReportsDb.findAllByUserId(userId);

  // ステータスフィルタをパース
  // 「すべて」の場合はフィルタを適用しない（全ステータスを表示）
  // statusFilterがundefinedの場合はデフォルト「未着手,進行中」を適用
  const filterAll = statusFilter === 'すべて';
  const statusList = filterAll ? null : (statusFilter ? statusFilter.split(',') : ['未着手', '進行中']);

  // よかったことを取得
  if (!itemTypeFilter || itemTypeFilter === 'goodPoint' || itemTypeFilter === 'すべて') {
    const goodPoints = goodPointsDb.findAllByUserId(userId);
    for (const goodPoint of goodPoints) {
      // statusListがnullの場合はフィルタなし（すべて表示）
      if (!statusList || statusList.includes(goodPoint.status)) {
        // このよかったことを含む日報を探す
        const report = reports.find((r) => r.goodPointIds.includes(goodPoint.id));
        if (report) {
          items.push({
            itemType: 'goodPoint',
            item: goodPoint,
            reportDate: report.date,
            reportId: report.id,
          });
        }
      }
    }
  }

  // 改善点を取得
  if (!itemTypeFilter || itemTypeFilter === 'improvement' || itemTypeFilter === 'すべて') {
    const improvements = improvementsDb.findAllByUserId(userId);
    for (const improvement of improvements) {
      // statusListがnullの場合はフィルタなし（すべて表示）
      if (!statusList || statusList.includes(improvement.status)) {
        // この改善点を含む日報を探す
        const report = reports.find((r) => r.improvementIds.includes(improvement.id));
        if (report) {
          items.push({
            itemType: 'improvement',
            item: improvement,
            reportDate: report.date,
            reportId: report.id,
          });
        }
      }
    }
  }

  // 日報日付の降順でソート
  items.sort((a, b) => b.reportDate.localeCompare(a.reportDate));

  return items;
}

/**
 * POST /api/good-points/:id/followups
 * よかったことにフォローアップを追加
 */
followupsRouter.post('/good-points/:id/followups', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const goodPointId = req.params.id;
  const goodPoint = goodPointsDb.findById(goodPointId);

  if (!goodPoint) {
    res.status(404).json({ message: 'よかったことが見つかりません' });
    return;
  }

  if (goodPoint.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const body: CreateFollowupRequest = req.body;
  const validationError = validateFollowup(body, body.status);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  const now = new Date().toISOString();
  const followup: Followup = {
    id: uuidv4(),
    userId,
    itemType: 'goodPoint',
    itemId: goodPointId,
    status: body.status,
    memo: body.memo || null,
    date: body.date || null,
    createdAt: now,
    updatedAt: now,
  };

  followupsDb.save(followup);

  // 成功カウント更新とステータス自動更新
  if (body.status === '再現成功') {
    const updated: GoodPoint = {
      ...goodPoint,
      success_count: goodPoint.success_count + 1,
    };

    // success_count >= 3 の場合、statusを「定着」に更新
    if (updated.success_count >= 3) {
      updated.status = '定着';
    } else {
      updated.status = '再現成功';
    }

    goodPointsDb.update(updated);
  }

  res.status(201).json(followup);
});

/**
 * POST /api/improvements/:id/followups
 * 改善点にフォローアップを追加
 */
followupsRouter.post('/improvements/:id/followups', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const improvementId = req.params.id;
  const improvement = improvementsDb.findById(improvementId);

  if (!improvement) {
    res.status(404).json({ message: '改善点が見つかりません' });
    return;
  }

  if (improvement.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const body: CreateFollowupRequest = req.body;
  const validationError = validateFollowup(body, body.status);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  const now = new Date().toISOString();
  const followup: Followup = {
    id: uuidv4(),
    userId,
    itemType: 'improvement',
    itemId: improvementId,
    status: body.status,
    memo: body.memo || null,
    date: body.date || null,
    createdAt: now,
    updatedAt: now,
  };

  followupsDb.save(followup);

  // 成功カウント更新とステータス自動更新
  if (body.status === '完了') {
    const updated: Improvement = {
      ...improvement,
      success_count: improvement.success_count + 1,
    };

    // success_count >= 3 の場合、statusを「習慣化」に更新
    if (updated.success_count >= 3) {
      updated.status = '習慣化';
    } else {
      updated.status = '完了';
    }

    improvementsDb.update(updated);
  }

  res.status(201).json(followup);
});

/**
 * GET /api/good-points/:id/followups
 * よかったことのフォローアップ履歴を取得
 */
followupsRouter.get('/good-points/:id/followups', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const goodPointId = req.params.id;
  const goodPoint = goodPointsDb.findById(goodPointId);

  if (!goodPoint) {
    res.status(404).json({ message: 'よかったことが見つかりません' });
    return;
  }

  if (goodPoint.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const followups = followupsDb.findByItemId('goodPoint', goodPointId);
  const data = followups.map((f) => ({
    id: f.id,
    status: f.status,
    memo: f.memo,
    date: f.date,
    createdAt: f.createdAt,
  }));

  res.status(200).json({ data });
});

/**
 * GET /api/improvements/:id/followups
 * 改善点のフォローアップ履歴を取得
 */
followupsRouter.get('/improvements/:id/followups', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const improvementId = req.params.id;
  const improvement = improvementsDb.findById(improvementId);

  if (!improvement) {
    res.status(404).json({ message: '改善点が見つかりません' });
    return;
  }

  if (improvement.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const followups = followupsDb.findByItemId('improvement', improvementId);
  const data = followups.map((f) => ({
    id: f.id,
    status: f.status,
    memo: f.memo,
    date: f.date,
    createdAt: f.createdAt,
  }));

  res.status(200).json({ data });
});

/**
 * GET /api/followups
 * フォロー項目一覧を取得
 */
followupsRouter.get('/followups', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const statusFilter = req.query.status as string | undefined;
  const itemTypeFilter = req.query.itemType as string | undefined;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  const allItems = getFollowupItems(userId, statusFilter, itemTypeFilter);
  const total = allItems.length;
  const paginatedItems = allItems.slice(offset, offset + limit);

  const response: FollowupItemsResponse = {
    data: paginatedItems,
    total,
  };

  res.status(200).json(response);
});

