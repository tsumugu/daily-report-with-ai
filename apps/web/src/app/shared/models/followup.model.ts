/**
 * フォローアップステータス
 */
export type FollowupStatus =
  | '未着手'
  | '進行中'
  | '再現成功'
  | '再現できず'
  | '完了'
  | '未達成';

/**
 * フォローアップモデル
 */
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
 * フォロー項目（よかったこと/改善点 + 日報情報）
 */
export interface FollowupItem {
  itemType: 'goodPoint' | 'improvement';
  item: {
    id: string;
    content: string;
    status: string;
    success_count: number;
    createdAt: string;
  };
  reportDate: string; // YYYY-MM-DD
  reportId: string;
}

/**
 * フォロー項目一覧レスポンス
 */
export interface FollowupItemsResponse {
  data: FollowupItem[];
  total: number;
}

