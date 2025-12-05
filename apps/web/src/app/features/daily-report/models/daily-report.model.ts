/**
 * よかったことのステータス
 */
export type GoodPointStatus = '未対応' | '再現成功' | '未達';

/**
 * 改善点のステータス
 */
export type ImprovementStatus = '未着手' | '進行中' | '完了';

/**
 * よかったこと
 */
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
 * 改善点
 */
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
 * 日報
 */
export interface DailyReport {
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
 * よかったこと入力フォーム
 */
export interface GoodPointForm {
  content: string;
  factors: string;
}

/**
 * 改善点入力フォーム
 */
export interface ImprovementForm {
  content: string;
  action: string;
}

