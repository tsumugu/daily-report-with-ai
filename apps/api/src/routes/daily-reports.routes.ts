import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { dailyReportsDb, goodPointsDb, improvementsDb } from '../db/daily-reports.db.js';
import { dailyReportGoalsDb } from '../db/daily-report-goals.db.js';
import { goalsDb } from '../db/goals.db.js';
import {
  DailyReport,
  GoodPoint,
  Improvement,
  CreateDailyReportRequest,
  UpdateDailyReportRequest,
  CreateGoodPointRequest,
  CreateImprovementRequest,
  UpdateGoodPointRequest,
  UpdateImprovementRequest,
  DailyReportResponse,
  DailyReportListItem,
  GoodPointSummary,
  ImprovementSummary,
  DailyReportGoal,
  GoalSummary,
  Goal,
} from '../models/daily-report.model.js';
import { followupsDb } from '../db/followups.db.js';

export const dailyReportsRouter = Router();

// 認証ミドルウェアを全ルートに適用
dailyReportsRouter.use(authMiddleware);

/**
 * バリデーションヘルパー
 */
const MAX_LENGTH = 1000;

function validateDailyReport(body: CreateDailyReportRequest): string | null {
  if (!body.date) {
    return 'date は必須です';
  }
  if (!body.events) {
    return 'events は必須です';
  }
  if (body.events.length > MAX_LENGTH) {
    return `events は${MAX_LENGTH}文字以内で入力してください`;
  }
  if (body.learnings && body.learnings.length > MAX_LENGTH) {
    return `learnings は${MAX_LENGTH}文字以内で入力してください`;
  }
  return null;
}

function validateGoodPoint(body: CreateGoodPointRequest): string | null {
  if (!body.content) {
    return 'content は必須です';
  }
  if (body.content.length > MAX_LENGTH) {
    return `content は${MAX_LENGTH}文字以内で入力してください`;
  }
  return null;
}

function validateImprovement(body: CreateImprovementRequest): string | null {
  if (!body.content) {
    return 'content は必須です';
  }
  if (body.content.length > MAX_LENGTH) {
    return `content は${MAX_LENGTH}文字以内で入力してください`;
  }
  return null;
}

/**
 * 日報をレスポンス形式に変換
 */
function toDailyReportResponse(report: DailyReport): DailyReportResponse {
  const goodPoints = goodPointsDb.findByIds(report.goodPointIds);
  const improvements = improvementsDb.findByIds(report.improvementIds);

  // 関連する目標を取得
  const dailyReportGoals = dailyReportGoalsDb.findByDailyReportId(report.id);
  const goals: GoalSummary[] = dailyReportGoals
    .map((drg) => {
      const goal = goalsDb.findById(drg.goalId);
      if (!goal) return null;
      return {
        id: goal.id,
        name: goal.name,
        startDate: goal.startDate,
        endDate: goal.endDate,
        parentId: goal.parentId,
      };
    })
    .filter((g): g is GoalSummary => g !== null);

  return {
    id: report.id,
    userId: report.userId,
    date: report.date,
    events: report.events,
    learnings: report.learnings,
    goals,
    goodPoints,
    improvements,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

/**
 * POST /api/daily-reports
 * 日報を新規作成
 */
dailyReportsRouter.post('/daily-reports', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const body: CreateDailyReportRequest = req.body;

  // バリデーション
  const validationError = validateDailyReport(body);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  // goalIdsのバリデーション
  if (body.goalIds && body.goalIds.length > 10) {
    res.status(400).json({ message: '目標は最大10個まで選択できます' });
    return;
  }

  // goalIdsが存在し、ユーザーの所有する目標かチェック
  if (body.goalIds && body.goalIds.length > 0) {
    for (const goalId of body.goalIds) {
      const goal = goalsDb.findById(goalId);
      if (!goal) {
        res.status(400).json({ message: `目標ID ${goalId} が見つかりません` });
        return;
      }
      if (goal.userId !== userId) {
        res.status(403).json({ message: '他のユーザーの目標を関連付けることはできません' });
        return;
      }
    }
  }

  // 同日の日報が既に存在するかチェック
  const existing = dailyReportsDb.findByUserIdAndDate(userId, body.date);
  if (existing) {
    res.status(400).json({ message: 'この日付の日報は既に存在します' });
    return;
  }

  const now = new Date().toISOString();
  const reportId = uuidv4();

  // よかったことを作成
  const goodPointIds: string[] = [];
  if (body.goodPoints && body.goodPoints.length > 0) {
    for (const gp of body.goodPoints) {
      const gpValidation = validateGoodPoint(gp);
      if (gpValidation) {
        res.status(400).json({ message: `goodPoints: ${gpValidation}` });
        return;
      }

      const goodPoint: GoodPoint = {
        id: uuidv4(),
        userId,
        content: gp.content,
        factors: gp.factors || null,
        tags: gp.tags || [],
        status: '未着手',
        success_count: 0,
        createdAt: now,
        updatedAt: now,
      };
      goodPointsDb.save(goodPoint);
      goodPointIds.push(goodPoint.id);
    }
  }

  // 改善点を作成
  const improvementIds: string[] = [];
  if (body.improvements && body.improvements.length > 0) {
    for (const imp of body.improvements) {
      const impValidation = validateImprovement(imp);
      if (impValidation) {
        res.status(400).json({ message: `improvements: ${impValidation}` });
        return;
      }

      const improvement: Improvement = {
        id: uuidv4(),
        userId,
        content: imp.content,
        action: imp.action || null,
        status: '未着手',
        success_count: 0,
        createdAt: now,
        updatedAt: now,
      };
      improvementsDb.save(improvement);
      improvementIds.push(improvement.id);
    }
  }

  // 日報を作成
  const report: DailyReport = {
    id: reportId,
    userId,
    date: body.date,
    events: body.events,
    learnings: body.learnings || null,
    goodPointIds,
    improvementIds,
    createdAt: now,
    updatedAt: now,
  };
  dailyReportsDb.save(report);

  // goalIdsが指定された場合、DailyReportGoal テーブルにレコードを作成
  if (body.goalIds && body.goalIds.length > 0) {
    for (const goalId of body.goalIds) {
      const dailyReportGoal: DailyReportGoal = {
        id: uuidv4(),
        dailyReportId: reportId,
        goalId,
        createdAt: now,
      };
      dailyReportGoalsDb.save(dailyReportGoal);
    }
  }

  res.status(201).json(toDailyReportResponse(report));
});

/**
 * よかったことサマリーを計算
 */
function calculateGoodPointSummary(goodPoints: GoodPoint[]): GoodPointSummary {
  const count = goodPoints.length;
  const statusSummary = {
    再現成功: 0,
    定着: 0,
  };

  goodPoints.forEach((gp) => {
    if (gp.status === '定着' || (gp.status === '再現成功' && gp.success_count >= 3)) {
      statusSummary.定着++;
    } else if (gp.status === '再現成功') {
      statusSummary.再現成功++;
    }
  });

  return {
    count,
    statusSummary,
  };
}

/**
 * 改善点サマリーを計算
 */
function calculateImprovementSummary(improvements: Improvement[]): ImprovementSummary {
  const count = improvements.length;
  const statusSummary = {
    完了: 0,
    習慣化: 0,
  };

  improvements.forEach((imp) => {
    if (imp.status === '習慣化' || (imp.status === '完了' && imp.success_count >= 3)) {
      statusSummary.習慣化++;
    } else if (imp.status === '完了') {
      statusSummary.完了++;
    }
  });

  return {
    count,
    statusSummary,
  };
}

/**
 * 一覧用のレスポンス形式に変換（軽量版）
 */
function toDailyReportListItem(
  report: DailyReport,
  goodPointsMap: Map<string, GoodPoint>,
  improvementsMap: Map<string, Improvement>,
  goalsByReportIdMap: Map<string, GoalSummary[]>
): DailyReportListItem {
  // よかったことの詳細情報を取得
  const goodPoints = report.goodPointIds
    .map((id) => goodPointsMap.get(id))
    .filter((gp): gp is GoodPoint => gp !== undefined);

  // 改善点の詳細情報を取得
  const improvements = report.improvementIds
    .map((id) => improvementsMap.get(id))
    .filter((imp): imp is Improvement => imp !== undefined);

  // よかったことのサマリーを計算
  const goodPointSummary = calculateGoodPointSummary(goodPoints);

  // 改善点のサマリーを計算
  const improvementSummary = calculateImprovementSummary(improvements);

  // 関連する目標を取得（N+1問題対策: 事前に一括取得したMapから取得）
  const goals = goalsByReportIdMap.get(report.id) || [];

  return {
    id: report.id,
    date: report.date,
    events: report.events,
    goals,
    goodPointIds: report.goodPointIds,
    improvementIds: report.improvementIds,
    goodPointSummary,
    improvementSummary,
  };
}

/**
 * GET /api/daily-reports
 * 日報一覧を取得
 */
dailyReportsRouter.get('/daily-reports', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  // クエリパラメータの取得
  const limit = parseInt(req.query.limit as string) || 30;
  const offset = parseInt(req.query.offset as string) || 0;

  // 全件取得
  const allReports = dailyReportsDb.findAllByUserId(userId);
  const total = allReports.length;

  // 日付降順でソート
  const sortedReports = allReports.sort((a, b) => {
    return b.date.localeCompare(a.date);
  });

  // ページング適用
  const paginatedReports = sortedReports.slice(offset, offset + limit);

  // N+1問題を回避するため、すべての日報のgoodPointIdsとimprovementIdsを収集
  const allGoodPointIds = new Set<string>();
  const allImprovementIds = new Set<string>();

  paginatedReports.forEach((report) => {
    report.goodPointIds.forEach((id) => allGoodPointIds.add(id));
    report.improvementIds.forEach((id) => allImprovementIds.add(id));
  });

  // 一括取得
  const goodPointsMap = new Map<string, GoodPoint>();
  const improvementsMap = new Map<string, Improvement>();

  allGoodPointIds.forEach((id) => {
    const gp = goodPointsDb.findById(id);
    if (gp) {
      goodPointsMap.set(id, gp);
    }
  });

  allImprovementIds.forEach((id) => {
    const imp = improvementsDb.findById(id);
    if (imp) {
      improvementsMap.set(id, imp);
    }
  });

  // N+1問題対策: すべての日報の関連目標を一括取得
  const dailyReportIds = paginatedReports.map((r) => r.id);
  const dailyReportGoalsMap = dailyReportGoalsDb.findByDailyReportIds(dailyReportIds);
  
  // 目標IDを収集
  const allGoalIds = new Set<string>();
  dailyReportGoalsMap.forEach((goals) => {
    goals.forEach((drg) => allGoalIds.add(drg.goalId));
  });

  // 目標を一括取得
  const goalsMap = new Map<string, Goal>();
  allGoalIds.forEach((id) => {
    const goal = goalsDb.findById(id);
    if (goal) {
      goalsMap.set(id, goal);
    }
  });

  // 日報IDごとの目標サマリーMapを作成
  const goalsByReportIdMap = new Map<string, GoalSummary[]>();
  dailyReportGoalsMap.forEach((goals, reportId) => {
    const goalSummaries: GoalSummary[] = goals
      .map((drg) => {
        const goal = goalsMap.get(drg.goalId);
        if (!goal) return null;
        return {
          id: goal.id,
          name: goal.name,
          startDate: goal.startDate,
          endDate: goal.endDate,
          parentId: goal.parentId,
        };
      })
      .filter((g): g is GoalSummary => g !== null);
    goalsByReportIdMap.set(reportId, goalSummaries);
  });

  // レスポンス作成（一覧用の軽量版）
  const data = paginatedReports.map((report) =>
    toDailyReportListItem(report, goodPointsMap, improvementsMap, goalsByReportIdMap)
  );

  res.status(200).json({ data, total });
});

/**
 * GET /api/daily-reports/:id
 * 日報詳細を取得
 */
dailyReportsRouter.get('/daily-reports/:id', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const report = dailyReportsDb.findById(req.params.id);
  if (!report) {
    res.status(404).json({ message: '日報が見つかりません' });
    return;
  }

  // 他のユーザーの日報へのアクセスを禁止
  if (report.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  res.status(200).json(toDailyReportResponse(report));
});

/**
 * PUT /api/daily-reports/:id
 * 日報を更新
 */
dailyReportsRouter.put('/daily-reports/:id', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const reportId = req.params.id;
  const report = dailyReportsDb.findById(reportId);
  if (!report) {
    res.status(404).json({ message: '日報が見つかりません' });
    return;
  }

  // 編集権限チェック
  if (report.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const body: UpdateDailyReportRequest = req.body;

  // バリデーション
  const validationError = validateDailyReport(body);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  // goalIdsのバリデーション
  if (body.goalIds && body.goalIds.length > 10) {
    res.status(400).json({ message: '目標は最大10個まで選択できます' });
    return;
  }

  // goalIdsが存在し、ユーザーの所有する目標かチェック
  if (body.goalIds && body.goalIds.length > 0) {
    for (const goalId of body.goalIds) {
      const goal = goalsDb.findById(goalId);
      if (!goal) {
        res.status(400).json({ message: `目標ID ${goalId} が見つかりません` });
        return;
      }
      if (goal.userId !== userId) {
        res.status(403).json({ message: '他のユーザーの目標を関連付けることはできません' });
        return;
      }
    }
  }

  // 日付変更時の同日チェック
  if (body.date !== report.date) {
    const existing = dailyReportsDb.findByUserIdAndDate(userId, body.date);
    if (existing && existing.id !== reportId) {
      res.status(400).json({ message: 'この日付の日報は既に存在します' });
      return;
    }
  }

  const now = new Date().toISOString();
  const newGoodPointIds: string[] = [];
  const newImprovementIds: string[] = [];

  // よかったことの処理
  if (body.goodPoints && body.goodPoints.length > 0) {
    for (const gp of body.goodPoints) {
      const gpValidation = validateGoodPoint(gp);
      if (gpValidation) {
        res.status(400).json({ message: `goodPoints: ${gpValidation}` });
        return;
      }

      if (gp.id) {
        // 既存のよかったことを更新
        // ID整合性チェック
        if (!report.goodPointIds.includes(gp.id)) {
          res.status(400).json({ message: 'このよかったことはこの日報に紐づいていません' });
          return;
        }

        const existingGoodPoint = goodPointsDb.findById(gp.id);
        if (!existingGoodPoint) {
          res.status(404).json({ message: 'よかったことが見つかりません' });
          return;
        }

        const updatedGoodPoint: GoodPoint = {
          ...existingGoodPoint,
          content: gp.content,
          factors: gp.factors || null,
          tags: gp.tags || [],
          updatedAt: now,
        };
        goodPointsDb.update(updatedGoodPoint);
        newGoodPointIds.push(gp.id);
      } else {
        // 新規作成
        const goodPoint: GoodPoint = {
          id: uuidv4(),
          userId,
          content: gp.content,
          factors: gp.factors || null,
          tags: gp.tags || [],
          status: '未着手',
          success_count: 0,
          createdAt: now,
          updatedAt: now,
        };
        goodPointsDb.save(goodPoint);
        newGoodPointIds.push(goodPoint.id);
      }
    }
  }

  // リクエストに含まれていない既存のよかったことについて
  // フォローアップデータが存在する場合は削除しない
  for (const goodPointId of report.goodPointIds) {
    if (!newGoodPointIds.includes(goodPointId)) {
      const followups = followupsDb.findByItemId('goodPoint', goodPointId);
      if (followups.length === 0) {
        // フォローアップデータが存在しない場合のみ削除
        goodPointsDb.delete(goodPointId);
      }
      // フォローアップデータが存在する場合は削除しない（PRDの要件）
    }
  }

  // 改善点の処理
  if (body.improvements && body.improvements.length > 0) {
    for (const imp of body.improvements) {
      const impValidation = validateImprovement(imp);
      if (impValidation) {
        res.status(400).json({ message: `improvements: ${impValidation}` });
        return;
      }

      if (imp.id) {
        // 既存の改善点を更新
        // ID整合性チェック
        if (!report.improvementIds.includes(imp.id)) {
          res.status(400).json({ message: 'この改善点はこの日報に紐づいていません' });
          return;
        }

        const existingImprovement = improvementsDb.findById(imp.id);
        if (!existingImprovement) {
          res.status(404).json({ message: '改善点が見つかりません' });
          return;
        }

        const updatedImprovement: Improvement = {
          ...existingImprovement,
          content: imp.content,
          action: imp.action || null,
          updatedAt: now,
        };
        improvementsDb.update(updatedImprovement);
        newImprovementIds.push(imp.id);
      } else {
        // 新規作成
        const improvement: Improvement = {
          id: uuidv4(),
          userId,
          content: imp.content,
          action: imp.action || null,
          status: '未着手',
          success_count: 0,
          createdAt: now,
          updatedAt: now,
        };
        improvementsDb.save(improvement);
        newImprovementIds.push(improvement.id);
      }
    }
  }

  // リクエストに含まれていない既存の改善点について
  // フォローアップデータが存在する場合は削除しない
  for (const improvementId of report.improvementIds) {
    if (!newImprovementIds.includes(improvementId)) {
      const followups = followupsDb.findByItemId('improvement', improvementId);
      if (followups.length === 0) {
        // フォローアップデータが存在しない場合のみ削除
        improvementsDb.delete(improvementId);
      }
      // フォローアップデータが存在する場合は削除しない（PRDの要件）
    }
  }

  // goalIdsの更新処理
  // 既存の関連付けをすべて削除
  dailyReportGoalsDb.deleteByDailyReportId(reportId);

  // 新しい関連付けを作成
  if (body.goalIds && body.goalIds.length > 0) {
    for (const goalId of body.goalIds) {
      const dailyReportGoal: DailyReportGoal = {
        id: uuidv4(),
        dailyReportId: reportId,
        goalId,
        createdAt: now,
      };
      dailyReportGoalsDb.save(dailyReportGoal);
    }
  }

  // 日報の更新
  const updatedReport: DailyReport = {
    ...report,
    date: body.date,
    events: body.events,
    learnings: body.learnings || null,
    goodPointIds: newGoodPointIds,
    improvementIds: newImprovementIds,
    updatedAt: now,
  };
  dailyReportsDb.update(updatedReport);

  res.status(200).json(toDailyReportResponse(updatedReport));
});

/**
 * POST /api/good-points
 * よかったことを単独で作成
 */
dailyReportsRouter.post('/good-points', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const body: CreateGoodPointRequest = req.body;

  const validationError = validateGoodPoint(body);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  const now = new Date().toISOString();
  const goodPoint: GoodPoint = {
    id: uuidv4(),
    userId,
    content: body.content,
    factors: body.factors || null,
    tags: body.tags || [],
    status: '未着手',
    success_count: 0,
    createdAt: now,
    updatedAt: now,
  };

  goodPointsDb.save(goodPoint);
  res.status(201).json(goodPoint);
});

/**
 * PATCH /api/good-points/:id
 * よかったことを更新
 */
dailyReportsRouter.patch('/good-points/:id', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const goodPoint = goodPointsDb.findById(req.params.id);
  if (!goodPoint) {
    res.status(404).json({ message: 'よかったことが見つかりません' });
    return;
  }

  if (goodPoint.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const body: UpdateGoodPointRequest = req.body;
  const now = new Date().toISOString();

  const updated: GoodPoint = {
    ...goodPoint,
    content: body.content ?? goodPoint.content,
    factors: body.factors ?? goodPoint.factors,
    tags: body.tags ?? goodPoint.tags,
    status: body.status ?? goodPoint.status,
    updatedAt: now,
  };

  goodPointsDb.update(updated);
  res.status(200).json(updated);
});

/**
 * POST /api/improvements
 * 改善点を単独で作成
 */
dailyReportsRouter.post('/improvements', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const body: CreateImprovementRequest = req.body;

  const validationError = validateImprovement(body);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  const now = new Date().toISOString();
  const improvement: Improvement = {
    id: uuidv4(),
    userId,
    content: body.content,
    action: body.action || null,
    status: '未着手',
    success_count: 0,
    createdAt: now,
    updatedAt: now,
  };

  improvementsDb.save(improvement);
  res.status(201).json(improvement);
});

/**
 * PATCH /api/improvements/:id
 * 改善点を更新
 */
dailyReportsRouter.patch('/improvements/:id', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const improvement = improvementsDb.findById(req.params.id);
  if (!improvement) {
    res.status(404).json({ message: '改善点が見つかりません' });
    return;
  }

  if (improvement.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const body: UpdateImprovementRequest = req.body;
  const now = new Date().toISOString();

  const updated: Improvement = {
    ...improvement,
    content: body.content ?? improvement.content,
    action: body.action ?? improvement.action,
    status: body.status ?? improvement.status,
    updatedAt: now,
  };

  improvementsDb.update(updated);
  res.status(200).json(updated);
});

