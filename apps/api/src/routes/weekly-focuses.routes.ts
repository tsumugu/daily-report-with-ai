import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getWeeklyFocusesDatabase } from '../db/weekly-focuses.db.js';
import { getGoodPointsDatabase, getImprovementsDatabase, getDailyReportsDatabase } from '../db/daily-reports.db.js';
import { getGoalsDatabase } from '../db/goals.db.js';
import {
  WeeklyFocus,
  CreateWeeklyFocusRequest,
} from '../models/daily-report.model.js';

export const weeklyFocusesRouter = Router();

// 認証ミドルウェアを全ルートに適用
weeklyFocusesRouter.use(authMiddleware);

/**
 * 週の開始日（月曜日）を計算
 */
function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
  const monday = new Date(d.setDate(diff));
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
}

/**
 * GET /api/weekly-focuses
 * 今週のフォーカスを取得
 */
weeklyFocusesRouter.get('/weekly-focuses', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const weeklyFocusesDb = await getWeeklyFocusesDatabase();
  const goodPointsDb = await getGoodPointsDatabase();
  const improvementsDb = await getImprovementsDatabase();
  const dailyReportsDb = await getDailyReportsDatabase();

  const weekStartDate = getWeekStartDate();
  const weeklyFocuses = weeklyFocusesDb.findByUserIdAndWeek(userId, weekStartDate);

  // ユーザーのすべての日報を取得（日報IDを取得するため）
  const reports = dailyReportsDb.findAllByUserId(userId);

  // よかったこと/改善点の情報を取得
  const data = weeklyFocuses.map((focus) => {
    let item;
    if (focus.itemType === 'goodPoint') {
      item = goodPointsDb.findById(focus.itemId);
    } else {
      item = improvementsDb.findById(focus.itemId);
    }

    // よかったこと/改善点を含む日報を見つける
    let reportId: string | null = null;
    if (item) {
      const report = reports.find((r) => {
        if (focus.itemType === 'goodPoint') {
          return r.goodPointIds.includes(focus.itemId);
        } else {
          return r.improvementIds.includes(focus.itemId);
        }
      });
      reportId = report?.id || null;
    }

    return {
      id: focus.id,
      userId: focus.userId,
      itemType: focus.itemType,
      itemId: focus.itemId,
      goalId: focus.goalId, // Phase 1で追加
      weekStartDate: focus.weekStartDate,
      createdAt: focus.createdAt,
      item: item || null,
      reportId,
    };
  });

  res.status(200).json({ data });
});

/**
 * POST /api/weekly-focuses
 * 週次フォーカスを設定
 */
weeklyFocusesRouter.post('/weekly-focuses', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const weeklyFocusesDb = await getWeeklyFocusesDatabase();
  const goodPointsDb = await getGoodPointsDatabase();
  const improvementsDb = await getImprovementsDatabase();
  const dailyReportsDb = await getDailyReportsDatabase();

  const body: CreateWeeklyFocusRequest = req.body;

  if (!body.itemType || !body.itemId) {
    res.status(400).json({ message: 'itemType と itemId は必須です' });
    return;
  }

  // 対象のよかったこと/改善点が存在するか確認
  let item;
  if (body.itemType === 'goodPoint') {
    item = goodPointsDb.findById(body.itemId);
  } else {
    item = improvementsDb.findById(body.itemId);
  }

  if (!item) {
    res.status(404).json({ message: '対象のよかったこと/改善点が見つかりません' });
    return;
  }

  if (item.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const weekStartDate = getWeekStartDate();

  // 今週のフォーカスが既に5件あるか確認
  const currentWeekFocuses = weeklyFocusesDb.findByUserIdAndWeek(userId, weekStartDate);
  if (currentWeekFocuses.length >= 5) {
    res.status(400).json({ message: '今週のフォーカスは最大5件まで設定できます' });
    return;
  }

  // 既に同じ項目が今週のフォーカスに設定されているか確認
  const existing = currentWeekFocuses.find(
    (f) => f.itemType === body.itemType && f.itemId === body.itemId
  );
  if (existing) {
    res.status(400).json({ message: 'この項目は既に今週のフォーカスに設定されています' });
    return;
  }

  const now = new Date().toISOString();
  const weeklyFocus: WeeklyFocus = {
    id: uuidv4(),
    userId,
    itemType: body.itemType,
    itemId: body.itemId,
    goalId: null, // Phase 1で追加
    weekStartDate,
    createdAt: now,
  };

  weeklyFocusesDb.save(weeklyFocus);

  // よかったこと/改善点を含む日報を見つける
  const reports = dailyReportsDb.findAllByUserId(userId);
  const report = reports.find((r) => {
    if (body.itemType === 'goodPoint') {
      return r.goodPointIds.includes(body.itemId);
    } else {
      return r.improvementIds.includes(body.itemId);
    }
  });
  const reportId = report?.id || null;

  // よかったこと/改善点の情報を含めて返す
  res.status(201).json({
    ...weeklyFocus,
    item,
    reportId,
  });
});

/**
 * DELETE /api/weekly-focuses/:id
 * 週次フォーカスを削除
 */
weeklyFocusesRouter.delete('/weekly-focuses/:id', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const weeklyFocusesDb = await getWeeklyFocusesDatabase();

  const weeklyFocus = weeklyFocusesDb.findById(req.params.id);

  if (!weeklyFocus) {
    res.status(404).json({ message: '週次フォーカスが見つかりません' });
    return;
  }

  if (weeklyFocus.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  weeklyFocusesDb.delete(req.params.id);
  res.status(200).json({ message: '削除しました' });
});

/**
 * PUT /api/weekly-focuses/:id/goal
 * 週次フォーカスと短期目標を接続する。
 */
weeklyFocusesRouter.put('/weekly-focuses/:id/goal', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const weeklyFocusesDb = await getWeeklyFocusesDatabase();
  const goalsDb = await getGoalsDatabase();

  const weeklyFocusId = req.params.id;
  const weeklyFocus = weeklyFocusesDb.findById(weeklyFocusId);

  if (!weeklyFocus) {
    res.status(404).json({ message: '週次フォーカスが見つかりません' });
    return;
  }

  if (weeklyFocus.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const body: { goalId?: string } = req.body;

  if (!body.goalId) {
    res.status(400).json({ message: 'goalId は必須です' });
    return;
  }

  const goal = goalsDb.findById(body.goalId);

  if (!goal) {
    res.status(404).json({ message: '目標が見つかりません' });
    return;
  }

  if (goal.userId !== userId) {
    res.status(403).json({ message: '目標へのアクセス権限がありません' });
    return;
  }

  // 接続する目標は短期目標（最下位階層）であること
  const children = goalsDb.findByParentId(goal.id);
  if (children.length > 0) {
    res.status(400).json({ message: '接続する目標は短期目標（最下位階層）である必要があります' });
    return;
  }

  // 週次フォーカスを更新
  const updatedWeeklyFocus: WeeklyFocus = {
    ...weeklyFocus,
    goalId: body.goalId,
  };

  weeklyFocusesDb.save(updatedWeeklyFocus);

  res.json(updatedWeeklyFocus);
});

/**
 * DELETE /api/weekly-focuses/:id/goal
 * 週次フォーカスと短期目標の接続を解除する。
 */
weeklyFocusesRouter.delete('/weekly-focuses/:id/goal', async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const weeklyFocusesDb = await getWeeklyFocusesDatabase();

  const weeklyFocusId = req.params.id;
  const weeklyFocus = weeklyFocusesDb.findById(weeklyFocusId);

  if (!weeklyFocus) {
    res.status(404).json({ message: '週次フォーカスが見つかりません' });
    return;
  }

  if (weeklyFocus.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  // 週次フォーカスを更新
  const updatedWeeklyFocus: WeeklyFocus = {
    ...weeklyFocus,
    goalId: null,
  };

  weeklyFocusesDb.save(updatedWeeklyFocus);

  res.json(updatedWeeklyFocus);
});

