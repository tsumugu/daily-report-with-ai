import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { dailyReportsDb, goodPointsDb, improvementsDb } from '../db/daily-reports.db.js';
import {
  DailyReport,
  GoodPoint,
  Improvement,
  CreateDailyReportRequest,
  CreateGoodPointRequest,
  CreateImprovementRequest,
  UpdateGoodPointRequest,
  UpdateImprovementRequest,
  DailyReportResponse,
} from '../models/daily-report.model.js';

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

  return {
    id: report.id,
    userId: report.userId,
    date: report.date,
    events: report.events,
    learnings: report.learnings,
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
        status: '未対応',
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

  res.status(201).json(toDailyReportResponse(report));
});

/**
 * 一覧用のレスポンス形式に変換（軽量版）
 */
function toDailyReportListItem(report: DailyReport) {
  return {
    id: report.id,
    date: report.date,
    events: report.events,
    goodPointIds: report.goodPointIds,
    improvementIds: report.improvementIds,
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

  // レスポンス作成（一覧用の軽量版）
  const data = paginatedReports.map(toDailyReportListItem);

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
    status: '未対応',
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

