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
export type GoodPointStatus = '未対応' | '再現成功' | '未達';

export interface GoodPoint {
  id: string;
  userId: string;
  content: string;
  factors: string | null;
  tags: string[];
  status: GoodPointStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 改善点モデル
 */
export type ImprovementStatus = '未着手' | '進行中' | '完了';

export interface Improvement {
  id: string;
  userId: string;
  content: string;
  action: string | null;
  status: ImprovementStatus;
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

