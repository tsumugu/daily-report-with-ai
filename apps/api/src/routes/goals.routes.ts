import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { goalsDb } from '../db/goals.db.js';
import { weeklyFocusesDb } from '../db/weekly-focuses.db.js';
import { dailyReportGoalsDb } from '../db/daily-report-goals.db.js';
import { dailyReportsDb } from '../db/daily-reports.db.js';
import {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalWithChildren,
  GoalDetailResponse,
  DailyReportSummary,
} from '../models/daily-report.model.js';

export const goalsRouter = Router();

// 認証ミドルウェアを全ルートに適用
goalsRouter.use(authMiddleware);

/**
 * バリデーションヘルパー
 */
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_SUCCESS_CRITERIA_LENGTH = 500;
const MAX_DEPTH = 4;

function validateGoal(body: CreateGoalRequest | UpdateGoalRequest, isCreate = false): string | null {
  if (isCreate || ('name' in body && body.name !== undefined)) {
    const name = isCreate ? (body as CreateGoalRequest).name : (body as UpdateGoalRequest).name;
    if (isCreate && (!name || name.trim() === '')) {
      return 'name は必須です';
    }
    if (name && name.length > MAX_NAME_LENGTH) {
      return `name は${MAX_NAME_LENGTH}文字以内で入力してください`;
    }
  }

  if ('description' in body && body.description !== undefined && body.description !== null) {
    if (body.description.length > MAX_DESCRIPTION_LENGTH) {
      return `description は${MAX_DESCRIPTION_LENGTH}文字以内で入力してください`;
    }
  }

  if ('successCriteria' in body && body.successCriteria !== undefined && body.successCriteria !== null) {
    if (body.successCriteria.length > MAX_SUCCESS_CRITERIA_LENGTH) {
      return `successCriteria は${MAX_SUCCESS_CRITERIA_LENGTH}文字以内で入力してください`;
    }
  }

  if (isCreate || ('startDate' in body && body.startDate !== undefined)) {
    const startDate = isCreate ? (body as CreateGoalRequest).startDate : (body as UpdateGoalRequest).startDate;
    if (isCreate && !startDate) {
      return 'startDate は必須です';
    }
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return 'startDate は YYYY-MM-DD 形式で入力してください';
    }
  }

  if (isCreate || ('endDate' in body && body.endDate !== undefined)) {
    const endDate = isCreate ? (body as CreateGoalRequest).endDate : (body as UpdateGoalRequest).endDate;
    if (isCreate && !endDate) {
      return 'endDate は必須です';
    }
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return 'endDate は YYYY-MM-DD 形式で入力してください';
    }
  }

  if ((isCreate || ('startDate' in body && body.startDate !== undefined)) && 
      (isCreate || ('endDate' in body && body.endDate !== undefined))) {
    const startDate = isCreate ? (body as CreateGoalRequest).startDate : (body as UpdateGoalRequest).startDate;
    const endDate = isCreate ? (body as CreateGoalRequest).endDate : (body as UpdateGoalRequest).endDate;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return 'endDate は startDate 以降である必要があります';
      }
    }
  }

  if ('goalType' in body && body.goalType !== undefined && body.goalType !== null) {
    const validTypes: ('skill' | 'project' | 'habit' | 'other')[] = ['skill', 'project', 'habit', 'other'];
    if (!validTypes.includes(body.goalType)) {
      return 'goalType は skill, project, habit, other のいずれかである必要があります';
    }
  }

  return null;
}

/**
 * 期間の整合性チェック
 */
function validatePeriod(goal: Goal, parentGoal: Goal | null): boolean {
  if (!parentGoal) {
    return true;
  }

  const goalStart = new Date(goal.startDate);
  const goalEnd = new Date(goal.endDate);
  const parentStart = new Date(parentGoal.startDate);
  const parentEnd = new Date(parentGoal.endDate);

  return goalStart >= parentStart && goalEnd <= parentEnd;
}

/**
 * 循環参照の防止
 */
function validateCircularReference(goalId: string, newParentId: string | null, goals: Goal[]): boolean {
  if (!newParentId) {
    return true;
  }

  let currentId = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === goalId) {
      return false; // 循環参照が発生
    }

    if (visited.has(currentId)) {
      break;
    }

    visited.add(currentId);
    const goal = goals.find(g => g.id === currentId);
    currentId = goal?.parentId || null;
  }

  return true;
}

/**
 * 階層の深さチェック
 */
function getDepth(goalId: string, goals: Goal[]): number {
  const goal = goals.find(g => g.id === goalId);
  if (!goal || !goal.parentId) {
    return 1;
  }

  return 1 + getDepth(goal.parentId, goals);
}

function validateDepth(goal: Goal, goals: Goal[]): boolean {
  const depth = getDepth(goal.id, goals);
  return depth <= MAX_DEPTH;
}

/**
 * 階層構造を構築
 */
function buildHierarchy(goals: Goal[]): GoalWithChildren[] {
  const goalMap = new Map<string, GoalWithChildren>();
  const rootGoals: GoalWithChildren[] = [];

  // すべての目標をGoalWithChildrenに変換
  for (const goal of goals) {
    goalMap.set(goal.id, { ...goal, children: [] });
  }

  // 階層構造を構築
  for (const goal of goals) {
    const goalWithChildren = goalMap.get(goal.id)!;
    if (goal.parentId) {
      const parent = goalMap.get(goal.parentId);
      if (parent) {
        parent.children.push(goalWithChildren);
      }
    } else {
      rootGoals.push(goalWithChildren);
    }
  }

  return rootGoals;
}

/**
 * GET /api/goals
 * 目標一覧を取得する。階層構造を含む。
 */
goalsRouter.get('/goals', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const hierarchy = req.query.hierarchy !== 'false'; // デフォルト: true
  const goals = goalsDb.findAllByUserId(userId);

  if (hierarchy) {
    const hierarchicalGoals = buildHierarchy(goals);
    res.json({ data: hierarchicalGoals });
  } else {
    res.json({ data: goals });
  }
});

/**
 * GET /api/goals/:id
 * 目標詳細を取得する。
 */
goalsRouter.get('/goals/:id', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const goalId = req.params.id;
  const goal = goalsDb.findById(goalId);

  if (!goal) {
    res.status(404).json({ message: '目標が見つかりません' });
    return;
  }

  if (goal.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  // 上位目標を取得
  let parent: { id: string; name: string } | null = null;
  if (goal.parentId) {
    const parentGoal = goalsDb.findById(goal.parentId);
    if (parentGoal) {
      parent = {
        id: parentGoal.id,
        name: parentGoal.name,
      };
    }
  }

  // 下位目標を取得
  const children = goalsDb.findByParentId(goalId).map(child => ({
    id: child.id,
    name: child.name,
  }));

  // 関連日報を取得
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;
  const sort = (req.query.sort as 'asc' | 'desc') || 'desc';

  const dailyReportGoals = dailyReportGoalsDb.findByGoalId(goalId);
  const relatedDailyReportIds = dailyReportGoals.map(drg => drg.dailyReportId);
  
  // 日報を取得してフィルタリング（ユーザーの所有物のみ）
  const relatedDailyReports: DailyReportSummary[] = relatedDailyReportIds
    .map(id => dailyReportsDb.findById(id))
    .filter((report): report is NonNullable<typeof report> => 
      report !== undefined && report.userId === userId
    )
    .map(report => ({
      id: report.id,
      date: report.date,
      events: report.events,
      createdAt: report.createdAt,
    }));

  // 並び替え
  relatedDailyReports.sort((a, b) => {
    if (sort === 'asc') {
      return a.date.localeCompare(b.date);
    } else {
      return b.date.localeCompare(a.date);
    }
  });

  // ページネーション
  const total = relatedDailyReports.length;
  const paginatedReports = relatedDailyReports.slice(offset, offset + limit);

  const response: GoalDetailResponse = {
    ...goal,
    parent,
    children,
    relatedDailyReports: paginatedReports,
    relatedDailyReportsCount: total,
  };

  res.json(response);
});

/**
 * POST /api/goals
 * 目標を作成する。
 */
goalsRouter.post('/goals', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const body: CreateGoalRequest = req.body;
  const validationError = validateGoal(body, true); // isCreate = true
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  // 親目標の検証
  let parentGoal: Goal | null = null;
  if (body.parentId) {
    parentGoal = goalsDb.findById(body.parentId);
    if (!parentGoal) {
      res.status(400).json({ message: '親目標が見つかりません' });
      return;
    }
    if (parentGoal.userId !== userId) {
      res.status(403).json({ message: '親目標へのアクセス権限がありません' });
      return;
    }
  }

  const now = new Date().toISOString();
  const goal: Goal = {
    id: uuidv4(),
    userId,
    name: body.name,
    description: body.description || null,
    startDate: body.startDate,
    endDate: body.endDate,
    parentId: body.parentId || null,
    goalType: body.goalType || null,
    successCriteria: body.successCriteria || null,
    createdAt: now,
    updatedAt: now,
  };

  // 期間の整合性チェック
  if (!validatePeriod(goal, parentGoal)) {
    res.status(400).json({ message: '下位目標の期間は上位目標の期間内に収まる必要があります' });
    return;
  }

  // 循環参照の防止
  const allGoals = goalsDb.findAllByUserId(userId);
  if (!validateCircularReference(goal.id, goal.parentId, allGoals)) {
    res.status(400).json({ message: 'この目標を上位目標に設定することはできません（循環参照が発生します）' });
    return;
  }

  // 階層の深さチェック
  goalsDb.save(goal);
  const updatedGoals = goalsDb.findAllByUserId(userId);
  if (!validateDepth(goal, updatedGoals)) {
    goalsDb.delete(goal.id);
    res.status(400).json({ message: '階層の深さは最大4階層までです' });
    return;
  }

  res.status(201).json(goal);
});

/**
 * PUT /api/goals/:id
 * 目標を更新する。
 */
goalsRouter.put('/goals/:id', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const goalId = req.params.id;
  const existingGoal = goalsDb.findById(goalId);

  if (!existingGoal) {
    res.status(404).json({ message: '目標が見つかりません' });
    return;
  }

  if (existingGoal.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  const body: UpdateGoalRequest = req.body;
  const validationError = validateGoal(body);
  if (validationError) {
    res.status(400).json({ message: validationError });
    return;
  }

  // 親目標の検証
  let parentGoal: Goal | null = null;
  const newParentId = body.parentId !== undefined ? body.parentId : existingGoal.parentId;
  if (newParentId) {
    parentGoal = goalsDb.findById(newParentId);
    if (!parentGoal) {
      res.status(400).json({ message: '親目標が見つかりません' });
      return;
    }
    if (parentGoal.userId !== userId) {
      res.status(403).json({ message: '親目標へのアクセス権限がありません' });
      return;
    }
  }

  const updatedGoal: Goal = {
    ...existingGoal,
    name: body.name !== undefined ? body.name : existingGoal.name,
    description: body.description !== undefined ? body.description : existingGoal.description,
    startDate: body.startDate !== undefined ? body.startDate : existingGoal.startDate,
    endDate: body.endDate !== undefined ? body.endDate : existingGoal.endDate,
    parentId: body.parentId !== undefined ? body.parentId : existingGoal.parentId,
    goalType: body.goalType !== undefined ? body.goalType : existingGoal.goalType,
    successCriteria: body.successCriteria !== undefined ? body.successCriteria : existingGoal.successCriteria,
    updatedAt: new Date().toISOString(),
  };

  // 期間の整合性チェック
  if (!validatePeriod(updatedGoal, parentGoal)) {
    res.status(400).json({ message: '下位目標の期間は上位目標の期間内に収まる必要があります' });
    return;
  }

  // 循環参照の防止
  const allGoals = goalsDb.findAllByUserId(userId);
  if (!validateCircularReference(goalId, updatedGoal.parentId, allGoals)) {
    res.status(400).json({ message: 'この目標を上位目標に設定することはできません（循環参照が発生します）' });
    return;
  }

  // 階層の深さチェック
  goalsDb.update(updatedGoal);
  const updatedGoals = goalsDb.findAllByUserId(userId);
  if (!validateDepth(updatedGoal, updatedGoals)) {
    // 元に戻す
    goalsDb.update(existingGoal);
    res.status(400).json({ message: '階層の深さは最大4階層までです' });
    return;
  }

  res.json(updatedGoal);
});

/**
 * DELETE /api/goals/:id
 * 目標を削除する。
 */
goalsRouter.delete('/goals/:id', (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: '認証が必要です' });
    return;
  }

  const goalId = req.params.id;
  const goal = goalsDb.findById(goalId);

  if (!goal) {
    res.status(404).json({ message: '目標が見つかりません' });
    return;
  }

  if (goal.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return;
  }

  // 下位目標が存在する場合は削除を許可しない
  const children = goalsDb.findByParentId(goalId);
  if (children.length > 0) {
    res.status(400).json({ message: '下位目標が存在するため、削除できません' });
    return;
  }

  // 削除対象の目標に接続されている週次フォーカス（goalId が削除対象の目標ID）を検索し、該当する週次フォーカスの goalId を null に更新する
  const connectedWeeklyFocuses = weeklyFocusesDb.findByGoalId(goalId);
  for (const weeklyFocus of connectedWeeklyFocuses) {
    const updatedWeeklyFocus = {
      ...weeklyFocus,
      goalId: null,
    };
    weeklyFocusesDb.save(updatedWeeklyFocus);
  }

  goalsDb.delete(goalId);
  res.json({ message: '目標を削除しました' });
});

