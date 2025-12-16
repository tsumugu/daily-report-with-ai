/**
 * 日報モデル
 */
export interface DailyReport {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  events: string;
  learnings: string | null;
  goodPointIds: string[];
  improvementIds: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * よかったことモデル
 */
// 後方互換性のため既存のステータス型も保持
export type GoodPointStatusLegacy = '未対応' | '再現成功' | '未達';
// 拡張されたステータス型
export type GoodPointStatus =
  | '未着手'
  | '進行中'
  | '再現成功'
  | '定着'
  | '再現できず'
  | GoodPointStatusLegacy; // 後方互換性

export interface GoodPoint {
  id: string;
  userId: string;
  content: string;
  factors: string | null;
  tags: string[];
  status: GoodPointStatus;
  success_count: number; // 成功回数（デフォルト: 0）
  createdAt: string;
  updatedAt: string;
}

/**
 * 改善点モデル
 */
// 拡張されたステータス型（既存のステータスも含む）
export type ImprovementStatus =
  | '未着手'
  | '進行中'
  | '完了'
  | '習慣化'
  | '未達成';

export interface Improvement {
  id: string;
  userId: string;
  content: string;
  action: string | null;
  status: ImprovementStatus;
  success_count: number; // 成功回数（デフォルト: 0）
  createdAt: string;
  updatedAt: string;
}

/**
 * 日報と目標の関連付けモデル
 */
export interface DailyReportGoal {
  id: string;
  dailyReportId: string;
  goalId: string;
  createdAt: string;
}

/**
 * 日報作成リクエスト
 */
export interface CreateDailyReportRequest {
  date: string;
  events: string;
  learnings?: string;
  goalIds?: string[]; // 関連する目標のID（最大10個）
  goodPoints?: {
    content: string;
    factors?: string;
    tags?: string[];
  }[];
  improvements?: {
    content: string;
    action?: string;
  }[];
}

/**
 * 日報更新リクエスト
 */
export interface UpdateDailyReportRequest {
  date: string;
  events: string;
  learnings?: string;
  goalIds?: string[]; // 関連する目標のID（最大10個）
  goodPoints?: {
    id?: string; // 既存のID（編集時）
    content: string;
    factors?: string;
    tags?: string[];
  }[];
  improvements?: {
    id?: string; // 既存のID（編集時）
    content: string;
    action?: string;
  }[];
}

/**
 * よかったこと作成リクエスト
 */
export interface CreateGoodPointRequest {
  content: string;
  factors?: string;
  tags?: string[];
}

/**
 * よかったこと更新リクエスト
 */
export interface UpdateGoodPointRequest {
  content?: string;
  factors?: string;
  tags?: string[];
  status?: GoodPointStatus;
}

/**
 * 改善点作成リクエスト
 */
export interface CreateImprovementRequest {
  content: string;
  action?: string;
}

/**
 * 改善点更新リクエスト
 */
export interface UpdateImprovementRequest {
  content?: string;
  action?: string;
  status?: ImprovementStatus;
}

/**
 * 目標サマリー（日報レスポンス用）
 */
export interface GoalSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  parentId: string | null;
}

/**
 * 日報レスポンス（よかったこと・改善点を含む）
 */
export interface DailyReportResponse {
  id: string;
  userId: string;
  date: string;
  events: string;
  learnings: string | null;
  goals: GoalSummary[]; // 関連する目標のサマリー
  goodPoints: GoodPoint[];
  improvements: Improvement[];
  createdAt: string;
  updatedAt: string;
}

/**
 * フォローアップモデル
 */
export type FollowupStatus =
  | '未着手'
  | '進行中'
  | '再現成功'
  | '再現できず'
  | '完了'
  | '未達成';

export interface Followup {
  id: string;
  userId: string;
  itemType: 'goodPoint' | 'improvement';
  itemId: string;
  status: FollowupStatus;
  memo: string | null;
  date: string | null; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

/**
 * フォローアップ作成リクエスト
 */
export interface CreateFollowupRequest {
  status?: FollowupStatus; // 任意（後方互換性のため）
  memo?: string;
  date?: string; // YYYY-MM-DD
}

/**
 * フォローアップ更新リクエスト
 */
export interface UpdateFollowupRequest {
  memo?: string;
  date?: string; // YYYY-MM-DD
}

/**
 * 週次フォーカスモデル
 */
export interface WeeklyFocus {
  id: string;
  userId: string;
  itemType: 'goodPoint' | 'improvement';
  itemId: string;
  goalId: string | null; // 短期目標のID（接続時、Phase 1で追加）
  weekStartDate: string; // YYYY-MM-DD（月曜日）
  createdAt: string;
}

/**
 * 週次フォーカス作成リクエスト
 */
export interface CreateWeeklyFocusRequest {
  itemType: 'goodPoint' | 'improvement';
  itemId: string;
}

/**
 * フォロー項目一覧レスポンス
 */
export interface FollowupItem {
  itemType: 'goodPoint' | 'improvement';
  item: GoodPoint | Improvement;
  reportDate: string; // YYYY-MM-DD
  reportId: string;
}

export interface FollowupItemsResponse {
  data: FollowupItem[];
  total: number;
}

/**
 * よかったことサマリー
 */
export interface GoodPointSummary {
  count: number;
  statusSummary: {
    再現成功: number;
    定着: number;
  };
}

/**
 * 改善点サマリー
 */
export interface ImprovementSummary {
  count: number;
  statusSummary: {
    完了: number;
    習慣化: number;
  };
}

/**
 * 日報一覧アイテム（拡張）
 */
export interface DailyReportListItem {
  id: string;
  date: string;
  events: string;
  goals: GoalSummary[]; // 関連する目標のサマリー
  goodPointIds: string[];
  improvementIds: string[];
  goodPointSummary: GoodPointSummary;
  improvementSummary: ImprovementSummary;
}

/**
 * 目標モデル
 */
export type GoalType = 'skill' | 'project' | 'habit' | 'other';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  parentId: string | null;
  goalType: GoalType | null;
  successCriteria: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 目標作成リクエスト
 */
export interface CreateGoalRequest {
  name: string;
  description?: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  parentId?: string | null;
  goalType?: GoalType | null;
  successCriteria?: string | null;
}

/**
 * 目標更新リクエスト
 */
export interface UpdateGoalRequest {
  name?: string;
  description?: string | null;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  parentId?: string | null;
  goalType?: GoalType | null;
  successCriteria?: string | null;
}

/**
 * 目標（階層構造を含む）
 */
export interface GoalWithChildren extends Goal {
  children: GoalWithChildren[];
}

/**
 * 日報サマリー（目標詳細レスポンスで使用）
 */
export interface DailyReportSummary {
  id: string;
  date: string;
  events: string;
  createdAt: string;
}

/**
 * 目標詳細レスポンス
 */
export interface GoalDetailResponse extends Goal {
  parent: {
    id: string;
    name: string;
  } | null;
  children: {
    id: string;
    name: string;
  }[];
  relatedDailyReports?: DailyReportSummary[]; // 関連する日報のサマリー
  relatedDailyReportsCount?: number; // 関連日報の総数
}

