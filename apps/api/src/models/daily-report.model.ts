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
 * 日報作成リクエスト
 */
export interface CreateDailyReportRequest {
  date: string;
  events: string;
  learnings?: string;
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
 * 日報レスポンス（よかったこと・改善点を含む）
 */
export interface DailyReportResponse {
  id: string;
  userId: string;
  date: string;
  events: string;
  learnings: string | null;
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
  status: FollowupStatus;
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

