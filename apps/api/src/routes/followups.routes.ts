import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { followupsDb } from '../db/followups.db.js';
import { goodPointsDb, improvementsDb, dailyReportsDb } from '../db/daily-reports.db.js';
import {
  Followup,
  CreateFollowupRequest,
  UpdateFollowupRequest,
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
const EPISODE_THRESHOLD = 3; // エピソード数の閾値
const ACTION_THRESHOLD = 3; // アクション数の閾値

function validateFollowup(body: CreateFollowupRequest, status: string): string | null {
  // statusは任意（後方互換性のため）
  // 指定されない場合は自動的に「再現成功」または「完了」を設定

  if (body.memo && body.memo.length > MAX_MEMO_LENGTH) {
    return `memo は${MAX_MEMO_LENGTH}文字以内で入力してください`;
  }

  // ステータスが「再現成功」「完了」の場合、dateは必須
  if ((status === '再現成功' || status === '完了') && !body.date) {
    return 'date は必須です';
  }

  // 日付の妥当性チェック（未来日付は許可しない）
  if (body.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return 'date はYYYY-MM-DD形式で入力してください';
    }
    // 日付文字列を直接比較（タイムゾーン問題を回避）
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (body.date > todayStr) {
      return '未来の日付は入力できません';
    }
  }

  return null;
}

/**
 * エピソード数をカウント
 */
function countEpisodes(itemId: string): number {
  const followups = followupsDb.findByItemId('goodPoint', itemId);
  return followups.filter((f) => f.status === '再現成功').length;
}

/**
 * アクション数をカウント
 */
function countActions(itemId: string): number {
  const followups = followupsDb.findByItemId('improvement', itemId);
  return followups.filter((f) => f.status === '完了').length;
}

/**
 * よかったことのステータスを自動判定
 */
function calculateGoodPointStatus(episodeCount: number): GoodPoint['status'] {
  if (episodeCount === 0) {
    return '未着手';
  } else if (episodeCount >= EPISODE_THRESHOLD) {
    return '定着';
  } else {
    return '進行中';
  }
}

/**
 * 改善点のステータスを自動判定
 */
function calculateImprovementStatus(actionCount: number): Improvement['status'] {
  if (actionCount === 0) {
    return '未着手';
  } else if (actionCount >= ACTION_THRESHOLD) {
    return '習慣化';
  } else {
    return '進行中';
  }
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
  
  // statusが指定されていない場合、自動的に「再現成功」を設定（後方互換性）
  const status = body.status || '再現成功';
  
  const validationError = validateFollowup(body, status);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  // dateは必須（エピソード追加時）
  if (!body.date) {
    res.status(400).json({ message: 'date は必須です' });
    return;
  }

  const now = new Date().toISOString();
  const followup: Followup = {
    id: uuidv4(),
    userId,
    itemType: 'goodPoint',
    itemId: goodPointId,
    status: '再現成功', // エピソードは常に「再現成功」
    memo: body.memo || null,
    date: body.date,
    createdAt: now,
    updatedAt: now,
  };

  followupsDb.save(followup);

  // エピソード数をカウント
  const episodeCount = countEpisodes(goodPointId);
  
  // ステータスを自動判定して更新
  const newStatus = calculateGoodPointStatus(episodeCount);
    const updated: GoodPoint = {
      ...goodPoint,
    status: newStatus,
    success_count: episodeCount,
    };

    goodPointsDb.update(updated);

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
  
  // statusが指定されていない場合、自動的に「完了」を設定（後方互換性）
  const status = body.status || '完了';
  
  const validationError = validateFollowup(body, status);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  // dateは必須（アクション追加時）
  if (!body.date) {
    res.status(400).json({ message: 'date は必須です' });
    return;
  }

  const now = new Date().toISOString();
  const followup: Followup = {
    id: uuidv4(),
    userId,
    itemType: 'improvement',
    itemId: improvementId,
    status: '完了', // アクションは常に「完了」
    memo: body.memo || null,
    date: body.date,
    createdAt: now,
    updatedAt: now,
  };

  followupsDb.save(followup);

  // アクション数をカウント
  const actionCount = countActions(improvementId);
  
  // ステータスを自動判定して更新
  const newStatus = calculateImprovementStatus(actionCount);
    const updated: Improvement = {
      ...improvement,
    status: newStatus,
    success_count: actionCount,
    };

    improvementsDb.update(updated);

  res.status(201).json(followup);
});

/**
 * PUT /api/good-points/:id/followups/:followupId
 * エピソードを更新
 */
followupsRouter.put('/good-points/:id/followups/:followupId', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const goodPointId = req.params.id;
  const followupId = req.params.followupId;

  // よかったことの存在確認
  const goodPoint = goodPointsDb.findById(goodPointId);
  if (!goodPoint) {
    res.status(404).json({ message: 'よかったことが見つかりません' });
    return;
  }

  // 編集権限チェック
  if (goodPoint.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  // エピソードの存在確認
  const followup = followupsDb.findById(followupId);
  if (!followup) {
    res.status(404).json({ message: 'エピソードが見つかりません' });
    return;
  }

  // エピソードの編集権限チェック
  if (followup.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  // エピソードがこのよかったことに紐づいているか確認
  if (followup.itemType !== 'goodPoint' || followup.itemId !== goodPointId) {
    res.status(400).json({ message: 'このエピソードはこのよかったことに紐づいていません' });
    return;
  }

  const body: UpdateFollowupRequest = req.body;
  
  // バリデーション（エピソードは常に「再現成功」）
  const validationError = validateFollowup({ ...body, status: '再現成功' }, '再現成功');
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  // dateは必須
  if (!body.date) {
    res.status(400).json({ message: 'date は必須です' });
    return;
  }

  const now = new Date().toISOString();
  
  // エピソードを更新
  const updatedFollowup: Followup = {
    ...followup,
    memo: body.memo || null,
    date: body.date,
    updatedAt: now,
  };
  followupsDb.update(updatedFollowup);

  // エピソード数を再カウント
  const episodeCount = countEpisodes(goodPointId);
  
  // ステータスを自動再計算
  const newStatus = calculateGoodPointStatus(episodeCount);
  const updatedGoodPoint: GoodPoint = {
    ...goodPoint,
    status: newStatus,
    success_count: episodeCount,
    updatedAt: now,
  };
  goodPointsDb.update(updatedGoodPoint);

  res.status(200).json(updatedFollowup);
});

/**
 * PUT /api/improvements/:id/followups/:followupId
 * アクションを更新
 */
followupsRouter.put('/improvements/:id/followups/:followupId', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const improvementId = req.params.id;
  const followupId = req.params.followupId;

  // 改善点の存在確認
  const improvement = improvementsDb.findById(improvementId);
  if (!improvement) {
    res.status(404).json({ message: '改善点が見つかりません' });
    return;
  }

  // 編集権限チェック
  if (improvement.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  // アクションの存在確認
  const followup = followupsDb.findById(followupId);
  if (!followup) {
    res.status(404).json({ message: 'アクションが見つかりません' });
    return;
  }

  // アクションの編集権限チェック
  if (followup.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  // アクションがこの改善点に紐づいているか確認
  if (followup.itemType !== 'improvement' || followup.itemId !== improvementId) {
    res.status(400).json({ message: 'このアクションはこの改善点に紐づいていません' });
    return;
  }

  const body: UpdateFollowupRequest = req.body;
  
  // バリデーション（アクションは常に「完了」）
  const validationError = validateFollowup({ ...body, status: '完了' }, '完了');
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  // dateは必須
  if (!body.date) {
    res.status(400).json({ message: 'date は必須です' });
    return;
  }

  const now = new Date().toISOString();
  
  // アクションを更新
  const updatedFollowup: Followup = {
    ...followup,
    memo: body.memo || null,
    date: body.date,
    updatedAt: now,
  };
  followupsDb.update(updatedFollowup);

  // アクション数を再カウント
  const actionCount = countActions(improvementId);
  
  // ステータスを自動再計算
  const newStatus = calculateImprovementStatus(actionCount);
  const updatedImprovement: Improvement = {
    ...improvement,
    status: newStatus,
    success_count: actionCount,
    updatedAt: now,
  };
  improvementsDb.update(updatedImprovement);

  res.status(200).json(updatedFollowup);
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
  // エピソードのみをフィルタ（status === '再現成功'）
  const episodes = followups.filter((f) => f.status === '再現成功');
  const episodeCount = episodes.length;
  const currentStatus = calculateGoodPointStatus(episodeCount);
  
  const data = episodes
    .sort((a, b) => (b.date || '').localeCompare(a.date || '')) // 日付の降順
    .map((f) => ({
    id: f.id,
      date: f.date,
    memo: f.memo,
    createdAt: f.createdAt,
  }));

  res.status(200).json({
    data,
    count: episodeCount,
    status: currentStatus,
  });
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
  // アクションのみをフィルタ（status === '完了'）
  const actions = followups.filter((f) => f.status === '完了');
  const actionCount = actions.length;
  const currentStatus = calculateImprovementStatus(actionCount);
  
  const data = actions
    .sort((a, b) => (b.date || '').localeCompare(a.date || '')) // 日付の降順
    .map((f) => ({
    id: f.id,
      date: f.date,
    memo: f.memo,
    createdAt: f.createdAt,
  }));

  res.status(200).json({
    data,
    count: actionCount,
    status: currentStatus,
  });
});

/**
 * DELETE /api/good-points/:id/followups/:followupId
 * よかったことのエピソードを削除
 */
followupsRouter.delete('/good-points/:id/followups/:followupId', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const goodPointId = req.params.id;
  const followupId = req.params.followupId;
  const goodPoint = goodPointsDb.findById(goodPointId);

  if (!goodPoint) {
    res.status(404).json({ message: 'よかったことが見つかりません' });
    return;
  }

  if (goodPoint.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const followup = followupsDb.findById(followupId);
  if (!followup) {
    res.status(404).json({ message: 'エピソードが見つかりません' });
    return;
  }

  if (followup.userId !== userId || followup.itemId !== goodPointId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  followupsDb.delete(followupId);

  // エピソード数を再カウント
  const episodeCount = countEpisodes(goodPointId);
  
  // ステータスを自動判定して更新
  const newStatus = calculateGoodPointStatus(episodeCount);
  const updated: GoodPoint = {
    ...goodPoint,
    status: newStatus,
    success_count: episodeCount,
  };

  goodPointsDb.update(updated);

  res.status(200).json({ message: 'エピソードを削除しました' });
});

/**
 * DELETE /api/improvements/:id/followups/:followupId
 * 改善点のアクションを削除
 */
followupsRouter.delete('/improvements/:id/followups/:followupId', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const improvementId = req.params.id;
  const followupId = req.params.followupId;
  const improvement = improvementsDb.findById(improvementId);

  if (!improvement) {
    res.status(404).json({ message: '改善点が見つかりません' });
    return;
  }

  if (improvement.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const followup = followupsDb.findById(followupId);
  if (!followup) {
    res.status(404).json({ message: 'アクションが見つかりません' });
    return;
  }

  if (followup.userId !== userId || followup.itemId !== improvementId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  followupsDb.delete(followupId);

  // アクション数を再カウント
  const actionCount = countActions(improvementId);
  
  // ステータスを自動判定して更新
  const newStatus = calculateImprovementStatus(actionCount);
  const updated: Improvement = {
    ...improvement,
    status: newStatus,
    success_count: actionCount,
  };

  improvementsDb.update(updated);

  res.status(200).json({ message: 'アクションを削除しました' });
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

